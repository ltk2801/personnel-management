import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  title: string; // Ví dụ: Backend Developer, HR Manager

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  maxSalary: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Employee, (employee) => employee.job)
  employees: Employee[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
