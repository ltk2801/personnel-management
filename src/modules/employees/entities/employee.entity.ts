import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Job } from '../../jobs/entities/job.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity('employees')
export class Employee {
  @ApiPropertyOptional({
    example: 'e3c96bf6-bc13-4d7f-98a5-7adadc1c76f0',
    description: 'ID cua nhan vien',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional({ example: 'An', description: 'Ten cua nhan vien' })
  @Column({ type: 'varchar', length: 10, nullable: true })
  firstName: string;

  @ApiPropertyOptional({ example: 'Nguyen', description: 'Ho cua nhan vien' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName: string;

  @ApiPropertyOptional({
    example: 'an.nguyen@example.com',
    description: 'Email cua nhan vien',
  })
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @ApiPropertyOptional({
    example: '0901234567',
    description: 'So dien thoai cua nhan vien',
  })
  @Column({ type: 'varchar', length: 10, unique: true, nullable: true })
  phoneNumber: string;

  @ApiPropertyOptional({
    example: '2026-04-05',
    description: 'Ngay vao lam',
  })
  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @ApiPropertyOptional({
    example: true,
    description: 'Trang thai lam viec cua nhan vien',
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // --- QUAN HỆ VÀ KHÓA NGOẠI ---

  @ApiPropertyOptional({
    example: '44d58f3c-f66b-4a9f-8ae0-0a6b349a02b1',
    description: 'ID phong ban',
  })
  @Column({ nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, (dept) => dept.employees, {
    onDelete: 'SET NULL', // Nếu xóa phòng ban, nhân viên này sẽ để trống phòng ban thay vì bị xóa theo
  })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @ApiPropertyOptional({
    example: '5de69b40-0f09-43dc-bdd7-d481c56b5c2a',
    description: 'ID chuc danh',
  })
  @Column({ nullable: true })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.employees, {
    onDelete: 'RESTRICT', // Không cho phép xóa Job nếu vẫn còn nhân viên đang làm job đó
  })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  // --- TRACKING ---

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;
}
