import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('jobs')
export class Job {
  @ApiPropertyOptional({
    example: '5de69b40-0f09-43dc-bdd7-d481c56b5c2a',
    description: 'ID cua job',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Backend Developer',
    description: 'Ten chuc danh cong viec',
  })
  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  title: string; // Ví dụ: Backend Developer, HR Manager

  @ApiProperty({
    example: 1000,
    description: 'Muc luong toi thieu',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minSalary: number;

  @ApiProperty({
    example: 2000,
    description: 'Muc luong toi da',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  maxSalary: number;

  @ApiProperty({
    example: true,
    description: 'Trang thai hoat dong cua job',
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Employee, (employee) => employee.job)
  employees: Employee[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
