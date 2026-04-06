import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Employee } from './entities/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

// Import DTO
import { UpdateEmployeeDto } from './dto/update-employee.dto';

// Import Interface

// Import service
import { JobsService } from '../jobs/jobs.service';
import { DepartmentsService } from '../departments/departments.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private readonly jobsService: JobsService,
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}
  // get all employees
  findAll() {
    return this.employeesRepository.find();
  }
  /////////////
  // create a new employee, Sử dụng manager từ bên ngoài truyền vào để áp dụng transaction
  async createEmpty(manager?: EntityManager) {
    // Neu co manager duoc truyen vao , dung no de lay Repository
    // Neu khong, dung repository mac dinh cua service
    const repo = manager
      ? manager.getRepository(Employee)
      : this.employeesRepository;
    try {
      // .create({}) giúp khởi tạo các giá trị default đã định nghĩa trong Entity
      const newEmployee = repo.create({});
      return await repo.save(newEmployee);
    } catch (error) {
      // Log ra để biết chính xác Database đang than phiền về cột nào
      console.error('Database Error:', error.message);
      throw error;
    }
  }
  /////////////
  // find an employee by id
  findOne(id: string) {
    return this.employeesRepository.findOneBy({ id });
  }
  // update an employee by ADMIN or Manager
  async updateAnEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const { jobId, departmentId } = updateEmployeeDto;

    // Check jobId
    if (jobId) {
      const checkJobId = await this.jobsService.findOne(jobId);
      if (!checkJobId) {
        throw new BadRequestException(`jobId : $${jobId} không tồn tại`);
      }
    }
    // Check departmentId
    if (departmentId) {
      const checkDepartmentId =
        await this.departmentsService.findOne(departmentId);
      if (!checkDepartmentId) {
        throw new BadRequestException(
          `DepartmentId : ${departmentId} không tồn tại `,
        );
      }
    }
    // Tiến hành update employee
    const result = await this.employeesRepository.update(id, updateEmployeeDto);
    if (result.affected === 0) {
      throw new BadRequestException(
        `Không tìm thấy nhân viên này để tiến hành update`,
      );
    }
    return {
      message: 'Updated Employee Successful',
    };
  }

  // Update profile
  async updateProfile(id: string, updateProfile: UpdateProfileDto) {
    //  ID nhập vào là id user, từ id user sẽ tiến hành lấy id của employee để tiến hành cập nhật profile
    Logger.log(id);
    const user = await this.usersService.findById(id);
    if (!user.employeeId) {
      throw new BadRequestException(`Không tim thấy nhân viên !`);
    }
    await this.employeesRepository.update(user.employeeId, updateProfile);
    return {
      message: `Updated Profile Successful`,
    };
  }

  // delete an employee
  async remove(id: string) {
    await this.employeesRepository.delete(id);
    return { deleted: true };
  }
}
