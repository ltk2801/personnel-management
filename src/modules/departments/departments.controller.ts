import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { RolesGuard } from 'src/common/guards/role.guard';

// import DTO
import { DepartmentCreateDto } from './dto/department-create-dto';
import { DepartmentUpdateDto } from './dto/department-update-dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // 1. Endpoint cho Dropdown (Chỉ lấy ID và Name của phòng ban) sử dụng interface
  @Get('select-options')
  getSelectOptions() {
    return this.departmentsService.getSelectOptions();
  }
  // 2. Kế thừa của của interface base ( có thêm active)
  @Get('select-options-active')
  getSelectOptionsActive() {
    return this.departmentsService.getAllDepartmentsActive();
  }

  // get all
  @Get('all')
  getAllDepartments() {
    return this.departmentsService.getAllDepartments();
  }

  // Ở đây tôi đã dùng Dto để validation dữ liệu nhập vào, nếu không sử dụng DTO, nó sẽ sử dụng các trường ở entity
  // Tiến hành phân quyền của user ở đây, chỉ có admin mới có thể tạo 1 phòng ban mới
  // Create a new department
  @UseGuards(AuthGuard, RolesGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép tạo phòng ban mới
  @Roles(Role.Admin) // Chỉ những user có role Admin mới được phép tạo phòng ban mới
  @Post()
  createDepartment(@Body() department: DepartmentCreateDto) {
    return this.departmentsService.createDepartment(department);
  }

  // Update a department
  @UseGuards(AuthGuard, RolesGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép cập nhật phòng ban
  @Roles(Role.Admin)
  @Patch(':id')
  // Đây là 1 ví dụ để sử dụng transfrom,
  updateDepartment(
    @Param('id') id: string,
    @Body() department: DepartmentUpdateDto,
  ) {
    return this.departmentsService.update(id, department);
  }

  // Delete a department
  @UseGuards(AuthGuard, RolesGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép cập nhật phòng ban
  @Roles(Role.Admin)
  @Delete(':id')
  removeDepartment(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  // Find a department with full info, ParseUUIDPipe là mong nhận param vào là 1 uuid, và ép kiểu cho biến id là string
  // Vì đã sử dụng UseInterceptor và ClassSerializerInterceptor nên sẽ chỉ trả về những thuộc
  // tính không nằm trong expose ở entity
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findDepartmentWithFullInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOne(id);
  }
  // =>> cách này sẽ khiến cho API trả về client bao gồm tất cả thông tin, có những thứ không cầ thiết
  // và thừa thãi, lộ dữ liệu của người dùng, gây nên không đáng tin cậy
}
