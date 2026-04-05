// Sử dụng các phương thức validation kế thừa từ RegisterUserDto
import { IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/common/enum/role.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Trang thai hoat dong cua user',
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái user phải là True/False' })
  isActive: boolean;

  // Sử dụng Enum để rằng buộc dữ liệu nhập vào DB
  @ApiPropertyOptional({
    enum: Role,
    example: Role.Admin,
    description: 'Vai tro cua user trong he thong',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: 'Role muse be either ADMIN, USER, or MANAGER',
  })
  role: Role;

  @ApiPropertyOptional({
    example: '8c7ec705-7dd4-41a8-bcd7-b7f383ef1b92',
    description: 'ID ho so nhan vien lien ket voi tai khoan',
  })
  @IsOptional()
  @IsString()
  employeeId: string;
}
