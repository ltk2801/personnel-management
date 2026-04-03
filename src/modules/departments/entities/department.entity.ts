import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Exclude } from 'class-transformer';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true, // Đảm bảo tên phòng ban là duy nhất ở cấp độ DB
    nullable: false, // Không được phép để trống tên
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true, // Mô tả có thể có hoặc không
  })
  description: string;

  @Column({
    type: 'boolean',
    default: true, // Trạng thái hoạt động của phòng ban
  })
  isActive: boolean;

  // --- QUAN HỆ | 1 Phòng ban có thể có nhiều Nhân Viên ---
  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];

  // --- TRACKING (Giúp bạn quản lý dữ liệu tốt hơn) ---
  @CreateDateColumn({ name: 'created_at' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Exclude()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude() // Hỗ trợ Soft Delete (Xóa ảo)
  deletedAt: Date;

  constructor(partial: Partial<Department>) {
    Object.assign(this, partial);
  }
}
