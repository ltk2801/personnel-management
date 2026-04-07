// job-import.dto.ts
import { IsString, IsBoolean, MaxLength, IsOptional } from 'class-validator';

export class DepartmentImportDto {
  @IsString()
  @MaxLength(50, { message: 'Tên phòng ban không được vượt quá 50 ký tự' })
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Tên phòng ban không được vượt quá 255 ký tự' })
  description: string;
}
