import { PickType } from '@nestjs/swagger';
import { UpdateEmployeeDto } from 'src/modules/employees/dto/update-employee.dto';

// Sử dụng PickType chỉ để lấy những trường cần thiết cho updateProfileDto
export class UpdateProfileDto extends PickType(UpdateEmployeeDto, [
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
] as const) {}
