// Sử dụng các phương thức validation kế thừa từ department-create
import { PartialType } from '@nestjs/swagger';
import { DepartmentCreateDto } from './department-create-dto';

export class DepartmentUpdateDto extends PartialType(DepartmentCreateDto) {}
