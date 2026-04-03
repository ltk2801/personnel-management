// Sử dụng các phương thức validation kế thừa từ RegisterUserDto
import { IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsBoolean({ message: 'Trạng thái user phải là True/False' })
  isActive: boolean;

  @IsString()
  employeeId: string;
}
