//  Đây là 1 file để validation các dữ liệu đầu vào từ 1 request, giúp đảm bảo dữ liệu gửi lên đúng định dạng, tránh lỗi khi xử lý dữ liệu trong service hoặc controller
// 1. Import các decorator từ class-validator để áp dụng các quy tắc validation cho từng trường dữ liệu
// 2. Tạo một class CreateUserDto để định nghĩa cấu trúc dữ liệu và các quy tắc validation cho việc tạo mới một user
// 3. Sử dụng các decorator như @IsString, @IsNotEmpty, @MinLength, @MaxLength để áp dụng các quy tắc validation cho từng trường dữ liệu
// 4. Khi có một request gửi lên với dữ liệu không hợp lệ, NestJS sẽ tự động trả về lỗi với thông báo chi tiết về lý do tại sao dữ liệu không hợp lệ

import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Sử dụng transform để nhận được dữ liệu lower case để tránh xảy ra trường hợp lúc viết thường
// lúc viết hoa
export class RegisterUserDto {
  @ApiProperty({
    example: 'admin01',
    description: 'Ten dang nhap cua tai khoan',
    minLength: 5,
    maxLength: 30,
  })
  @IsString({ message: 'Username phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @MinLength(5, { message: 'Username tối thiểu 5 ký tự' })
  @MaxLength(30, { message: 'Username tối đa 30 ký tự' })
  @Transform(({ value }) => value.trim().toLowerCase())
  username: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'Mat khau manh gom chu hoa, chu thuong, so va ky tu dac biet',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Mật khẩu quá yếu: Cần ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  password: string;
}
