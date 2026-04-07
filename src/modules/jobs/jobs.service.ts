import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Job } from './entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Import DTO
import { JobCreateDto } from './dto/job-create-dto';
import { ExcelExportService } from 'src/common/excel/excel.export.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    private readonly excelExportServices: ExcelExportService,
  ) {}
  // Check Min & Max Salary
  private async validateSalary(minSalary?: number, maxSalary?: number) {
    return minSalary <= maxSalary ? true : false;
  }

  // get all jobs
  findAll() {
    return this.jobsRepository.find();
  }
  //  *************** create a new job
  async createJob(job: JobCreateDto) {
    const checkSalary = await this.validateSalary(job.minSalary, job.maxSalary);
    if (!checkSalary) {
      throw new BadRequestException(
        'Mức lương tối thiểu phải bé hơn hoặc bằng mức lương tối đa',
      );
    }
    await this.jobsRepository.save(job);
    return {
      message: 'Create a new job successfull',
    };
  }
  // find a job by id
  findOne(id: string) {
    return this.jobsRepository.findOneBy({ id });
  }
  // update a job
  async update(id: string, job: Job) {
    await this.jobsRepository.update(id, job);
    return this.jobsRepository.findOneBy({ id });
  }
  // delete a job
  async remove(id: string) {
    await this.jobsRepository.delete(id);
    return { deleted: true };
  }
  // Export data jobs to excel

  async exportJobssToExcel(fields?: string, page?: number, limit?: number) {
    // Dinh nghia danh sach cac cot hop le ma DB co
    const validFields = ['id', 'minSalary', 'maxSalary', 'isActive', 'title'];

    // Su dung Ham lay ra field, phan trang
    const findOptions = await this.excelExportServices.optionsPagination(
      fields,
      page,
      limit,
      validFields,
    );

    const jobs = await this.jobsRepository.find(findOptions);

    // Chuyển đổi dữ liệu lấy về thành header,key,value
    const excelColumns = this.excelExportServices.autoGenerateColumns(jobs);

    // Gọi service export file excel
    return this.excelExportServices.generateExcelStream(excelColumns, jobs);
  }
}
