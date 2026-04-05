import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // Get all employees
  @ApiOperation({ summary: 'Lay danh sach nhan vien' })
  @ApiOkResponse({ description: 'Lay danh sach nhan vien thanh cong' })
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  // Get a single employee by id
  @ApiOperation({ summary: 'Lay chi tiet mot nhan vien' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiOkResponse({ description: 'Lay chi tiet nhan vien thanh cong' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  // update an employee
  @ApiOperation({ summary: 'Cap nhat nhan vien' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiBody({ type: Employee })
  @ApiOkResponse({ description: 'Cap nhat nhan vien thanh cong' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() employee: Employee) {
    return this.employeesService.update(id, employee);
  }

  // delete an employee
  @ApiOperation({ summary: 'Xoa nhan vien' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiOkResponse({ description: 'Xoa nhan vien thanh cong' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
