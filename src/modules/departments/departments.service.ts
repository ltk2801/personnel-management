import { Injectable, Logger } from '@nestjs/common';
import { Department } from './entities/department.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

// import các Data Transfer Object (DTO) để có thể sử dụng trong service
import { DepartmentCreateDto } from './dto/department-create-dto';
import { DepartmentUpdateDto } from './dto/department-update-dto';

// import các interface mình vừa tạo để có thể sử dụng gửi dữ liệu về cho FE
import {
  IDepartmentBase,
  IDepartmentList,
} from './interfaces/department.interface';
import { ExcelExportService } from 'src/common/excel/excel.export.service';
import { DepartmentImportDto } from './dto/department-import-dto';
import { DepartmentTransformer } from './transform/department.transfrom';
import { ExcelImportService } from 'src/common/excel/excel.import.service';

@Injectable()
export class DepartmentsService {
  // Cái này là để khai báo repository của TypeORM để có thể làm việc với database thông qua entity Department
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    private excelExportService: ExcelExportService,
    private excelImportService: ExcelImportService,
  ) {}

  private async validateImportDto(dto: DepartmentImportDto): Promise<string[]> {
    const dtoInstance = plainToInstance(DepartmentImportDto, dto);
    const validationErrors = await validate(dtoInstance);

    return validationErrors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
  }

  // Các phương thức để làm việc với dữ liệu phòng ban, sẽ được gọi từ controller
  // Khi FE chỉ cần lấy dữ liệu là id và name của phòng ban
  async getSelectOptions(): Promise<IDepartmentBase[]> {
    // TypeORM sẽ tự hiểu trả về mảng có cấu trúc của IDepartmentBase
    return await this.departmentsRepository.find({
      select: ['id', 'name'],
    });
  }

  // GET ALL DEPARTMENTS bao gồm ID,NAME kế thừa từ interfaceBase + thêm active
  async getAllDepartmentsActive(): Promise<IDepartmentList[]> {
    // TypeORM sẽ tự hiểu trả về mảng có cấu trúc của IDepartmentList
    return await this.departmentsRepository.find({
      select: ['id', 'name', 'description'],
    });
  }

  // GET ALL DEPARTMENTS WITH FULL INFO
  async getAllDepartments(): Promise<Department[]> {
    return await this.departmentsRepository.find();
  }

  // create a new department use DTO
  createDepartment(department: DepartmentCreateDto) {
    return this.departmentsRepository.save(department);
  }

  // Ví dụ khi muốn truy xuất thông tin của 1 phòng ban thì bình thường chúng ta sẽ làm như vạy
  // find a department by id  s
  findOne(id: string) {
    return this.departmentsRepository.findOneBy({ id });
  }
  // update a department
  async update(id: string, department: DepartmentUpdateDto) {
    await this.departmentsRepository.update(id, department);
    return this.departmentsRepository.findOneBy({ id });
  }
  // delete a department
  async remove(id: string) {
    await this.departmentsRepository.delete(id);
    return { deleted: true };
  }

  // **************** Export data department to excel

  async exportDepartmentsToExcel(
    fields?: string,
    page?: number,
    limit?: number,
  ) {
    // Dinh nghia danh sach cac cot hop le ma DB co
    const validFields = ['id', 'isActive', 'name', 'description'];
    // Su dung ham
    const findOptions = await this.excelExportService.optionsPagination(
      fields,
      page,
      limit,
      validFields,
    );
    const departments = await this.departmentsRepository.find(findOptions);
    // Chuyển đổi dữ liệu lấy về thành header,key,value
    const excelColumns =
      this.excelExportService.autoGenerateColumns(departments);

    // Gọi service export file excel
    return this.excelExportService.generateExcelStream(
      excelColumns,
      departments,
    );
  }

  // ************ import data department to db
  async importDepartmentsFromExcel(fileBuffer: Buffer) {
    const existingDepartments = await this.departmentsRepository.find({
      select: ['name'],
    });
    const existingNames = new Set(
      existingDepartments.map((depart) => depart.name.trim().toLowerCase()),
    );
    const importedNames = new Set<string>();

    const importResult =
      await this.excelImportService.importFromBuffer<DepartmentImportDto>(
        fileBuffer,
        {
          validFields: ['name', 'description', 'isActive'],
          requiredFields: ['name', 'description', 'isActive'],
          fieldLabels: {
            name: 'Tên phòng ban',
            description: 'Mô tả về phòng ban',
            isActive: 'Trạng thái',
          },
          rowTransformer: (row) => DepartmentTransformer.toDto(row),
          rowValidator: async (row, context) => {
            const dto = DepartmentTransformer.toDto(row);
            const errors = await this.validateImportDto(dto);
            const name = dto.name.trim();
            const normalizedName = name.toLowerCase();

            if (name && existingNames.has(normalizedName)) {
              errors.push('Tên phòng ban đã tồn tại trong hệ thống');
            }

            if (name && importedNames.has(normalizedName)) {
              errors.push('Tên phòng ban bị trùng trong file import');
            }

            if (errors.length === 0 && name) {
              importedNames.add(normalizedName);
            }

            return errors.map(
              (message) => `Dòng ${context.rowNumber}: ${message}`,
            );
          },
        },
      );

    if (importResult.rows.length > 0) {
      const departments = this.departmentsRepository.create(importResult.rows);
      await this.departmentsRepository.save(departments);
    }

    return {
      message:
        importResult.errorCount > 0
          ? 'Import department hoàn tất, có một số dòng không hợp lệ'
          : 'Import department thành công',
      summary: {
        totalRows: importResult.totalRows,
        successCount: importResult.successCount,
        errorCount: importResult.errorCount,
      },
      errors: importResult.errors,
    };
  }
}
