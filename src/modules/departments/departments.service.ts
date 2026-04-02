import { Injectable } from '@nestjs/common';
import { Department } from './entities/department.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import các interface mình vừa tạo để có thể sử dụng gửi dữ liệu về cho FE
import {
  IDepartmentBase,
  IDepartmentList,
  IDepartmentDetail,
} from './interfaces/department.interface';

@Injectable()
export class DepartmentsService {
  // Cái này là để khai báo repository của TypeORM để có thể làm việc với database thông qua entity Department
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  // Các phương thức để làm việc với dữ liệu phòng ban, sẽ được gọi từ controller
  // Khi FE chỉ cần lấy dữ liệu là id và name của phòng ban
  async getSelectOptions(): Promise<IDepartmentBase[]> {
    const departments = await this.departmentsRepository.find({
      select: ['id', 'name'], // Chỉ lấy id và name để trả về cho FE
    });
    console.log(departments);
    return departments as IDepartmentBase[];
    // return departments.map((dept) => ({
    //   id: dept.id,
    //   name: dept.name,
    // }));
  }

  // create a new department
  create(department: Department) {
    console.log(department);
    return this.departmentsRepository.save(department);
  }
  // find a department by id
  findOne(id: string) {
    return this.departmentsRepository.findOneBy({ id });
  }
  // update a department
  async update(id: string, department: Department) {
    await this.departmentsRepository.update(id, department);
    return this.departmentsRepository.findOneBy({ id });
  }
  // delete a department
  async remove(id: string) {
    await this.departmentsRepository.delete(id);
    return { deleted: true };
  }
}
