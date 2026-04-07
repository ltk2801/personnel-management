import { Role } from 'src/common/enum/role.enum';
import { Expose } from 'class-transformer';

export class AuthFullInfoReponseDto {
  @Expose() idUser: string;
  @Expose() username: string;
  @Expose() isActive: boolean;
  @Expose() role: Role;
  @Expose() employeeId: string;

  @Expose() email: string;
  @Expose() hireDate: Date;
  @Expose() lastName: string;
  @Expose()
  firstName: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  departmentId: string;
  @Expose()
  departmentName: string;
  @Expose()
  departmentDescription: string;
  @Expose()
  jobId: string;
  @Expose()
  title: string;
  @Expose()
  minSalary: number;
  @Expose()
  maxSalary: number;
}
