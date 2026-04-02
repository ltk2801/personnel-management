import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { RolesGuard } from 'src/common/guards/role.guard';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // 1. Endpoint cho Dropdown (Chỉ lấy ID và Name của phòng ban)
  @Get('select-options')
  getSelectOptions() {
    return this.departmentsService.getSelectOptions();
  }

  // Get a single department by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  // Create a new department
  @UseGuards(AuthGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép tạo phòng ban mới
  @Roles(Role.Admin) // Chỉ những user có role Admin mới được phép tạo phòng ban mới
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() department: Department) {
    return this.departmentsService.create(department);
  }

  // Update a department
  @UseGuards(AuthGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép cập nhật phòng ban
  @Patch(':id')
  update(@Param('id') id: string, @Body() department: Department) {
    return this.departmentsService.update(id, department);
  }
  // Delete a department
  @UseGuards(AuthGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép xóa phòng ban
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
