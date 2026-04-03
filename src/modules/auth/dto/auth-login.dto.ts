// Sử dụng các phương thức validation kế thừa từ  Register
import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './auth-register.dto';

export class LoginUserDto extends PartialType(RegisterUserDto) {}
