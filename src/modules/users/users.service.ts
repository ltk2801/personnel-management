import {
  Injectable,
  Logger,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { User } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import các interface mình vừa tạo để có thể sử dụng gửi dữ liệu về cho FE
import { IuserBase, IuserList } from './interfaces/users.interface';
import { UpdateUserDto } from './dto/update-user.dto';

// Import radis for delete refresh_token when delete user
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class UsersService {
  // Khai báo repository của TypeORM để có thể làm việc với database thông qua entity User
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // import cache_manager de quan ly key redis
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ***** FUNCTION FE lấy dữ liệu là id , username và password của user
  async getSelectOptions(): Promise<IuserBase[]> {
    const users = await this.userRepository.find({
      select: ['id', 'username'], // Chỉ lấy id và username để trả về cho FE
    });
    return users as unknown as IuserBase[];
  }

  // ****** FUNCTION find a user by username (có thể dùng để kiểm tra đăng nhập sau này)
  async findByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({ where: { username } });
  }
  // **** FUNCTION find a user by id
  async findById(id: string): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }
  // ****** FUNCTION Get all role in table USER (để có thể hiển thị ra FE)
  async findAllRoles(): Promise<string[]> {
    const roles = await this.userRepository
      .createQueryBuilder('user')
      .select('DISTINCT user.role', 'role')
      .getRawMany();
    const rolesList = roles.map((r) => r.role);
    return rolesList;
  }
  // ***** FUNCTION UPDATE PASSWORD
  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.userRepository.update(id, { password: newPassword });
  }

  // **** FUNCTION UPDATE USER Do ADMIN thực hiện, add EmployeeID và Lock/UnLock tài khoản
  async updateUser(id: string, user: UpdateUserDto) {
    await this.userRepository.update(id, user);
    return {
      message: 'successful updated',
    };
  }

  // ***** FUNCTION DELETE USER by ADMIN
  async deleteUser(id: string, sub: string) {
    // can't delete admin
    if (id === sub) {
      throw new UnauthorizedException('Admin cant delete admin');
    }
    await this.userRepository.delete(id);
    await this.cacheManager.del(`refresh_token:${id}`);
    return {
      message: 'deleted successful',
    };
  }
}
