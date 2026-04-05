// Sử dụng các phương thức validation kế thừa từ  Register
import { PartialType } from '@nestjs/swagger';
import { RegisterUserDto } from './auth-register.dto';

export class LoginUserDto extends PartialType(RegisterUserDto) {}
