import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/users.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
// Import DTOs
import { RegisterUserDto } from './dto/auth-register.dto';
import { LoginUserDto } from './dto/auth-login.dto';
import { ChangePasswordUserDto } from './dto/auth-change-password.dto';
// JWT
import { JwtService } from '@nestjs/jwt';
// Import bcrypt để compare lại password khi đăng nhập
import * as bcrypt from 'bcrypt';
// Import Employee service
import { EmployeesService } from '../employees/employees.service';
// Import radis for set refresh_token
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

//  REFRESH_TOKEN ttl
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7day

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly employeesService: EmployeesService,
    // import Inject Datasource for manage transaction (use DataSource for this)
    private dataSource: DataSource,
    // import cache_manager
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ******* FUNCTION. create a new user // Đã sử dụng Dto để có thể validation dư liệu đầu vào
  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    // 1. Hash mật khẩu của user trước khi lưu vào database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

    // Begin transaction
    return await this.dataSource.transaction(async (manager) => {
      // Kiểm tra tồn tại (Dùng manager để check trong phiên làm việc của transaction)
      const exitsUser = await manager.findOne(User, {
        where: { username: registerUserDto.username },
      });
      if (exitsUser) {
        throw new ConflictException('Username đã tồn tại');
      }
      try {
        // Bước 1 : Tạo EMPLOYEE TRƯỚC (Vì User cần ID của Employee, Employee là bảng cha),
        // truyen manager vao de quan ly transaction
        const savedEmployee = await this.employeesService.createEmpty(manager);
        // Tao user va gan employee vua tao vao
        const newUser = manager.create(User, {
          username: registerUserDto.username,
          password: hashedPassword,
          employeeId: savedEmployee.id, // TypeORM tu trich xuat ID tu project nay
        });
        // luu user vao db
        return await manager.save(newUser);
      } catch (error) {
        // Nếu bước 4 hoặc 5 lỗi, toàn bộ thay đổi ở bước 3 (Employee) sẽ bị xóa sạch
        throw new InternalServerErrorException(
          'Đăng ký thất bại, dữ liệu đã được rollback',
        );
      }
    });
  }

  // *** FUCTION LOGIN USER
  async signIn(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // 1. Tìm username theo username bằng userService
    const user = await this.usersService.findByUsername(loginUserDto.username);

    // 2. Nếu không tìm thấy user thì trả về lỗi UnauthorizedException
    if (!user) {
      throw new UnauthorizedException(
        'Không tìm thấy userName này trên hệ thống',
      );
    }

    // 3. Kiểm tra mật khẩu có khớp với mật khẩu đã lưu trong database hay không
    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    // 4. Generate JWT tokens
    const payload = { sub: user.id };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // 5. Lưu refresh token vào radis
    await this.cacheManager.set(
      `refresh_token:${payload.sub}`,
      refresh_token,
      REFRESH_TOKEN_TTL,
    );

    const check = await this.cacheManager.get(`refresh_token:${payload.sub}`);
    return {
      access_token,
      refresh_token,
    };
  }

  // // *** FUNCTION REFRESH TOKEN - Tạo access token mới từ refresh token
  async refreshToken(
    refreshToken: string,
  ): Promise<{ new_access_token: string; new_refresh_token: string }> {
    try {
      // 1. Verify refresh token có hợp lệ không
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const userId = payload.sub;
      // 2. Lấy token đang lưu trong Redis của User này
      // Key pattern: refresh_token:userId
      const storedToken = await this.cacheManager.get(
        `refresh_token:${userId}`,
      );
      // 3. Kiểm tra: Nếu không có trong Redis hoặc không khớp với token client gửi lên
      if (!storedToken || storedToken !== refreshToken) {
        // Security Alert: Nếu token hợp lệ về chữ ký nhưng không khớp Redis,
        // có thể token này đã bị dùng rồi (nghi vấn bị đánh cắp).
        throw new UnauthorizedException('Phiên làm việc không hợp lệ');
      }
      // 4. Token Rotation : xoa token cu va cap lai bo token moi
      await this.cacheManager.del(`refresh_token:${userId}`);
      // Tao payload moi
      const newPayload = {
        sub: userId,
      };
      const new_access_token = await this.jwtService.signAsync(newPayload);
      const new_refresh_token = await this.jwtService.signAsync(newPayload, {
        expiresIn: '7d',
      });
      // 5. Lưu refresh token vào radis
      await this.cacheManager.set(
        `refresh_token:${newPayload.sub}`,
        new_refresh_token,
        REFRESH_TOKEN_TTL,
      );

      return {
        new_access_token,
        new_refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }

  // ChangePassword
  async changePassword(
    userId: string,
    changePasswordUserdto: ChangePasswordUserDto,
  ): Promise<{}> {
    // Find user by userId
    const user = await this.usersService.findById(userId);
    // if user not found
    if (!user) {
      throw new UnauthorizedException(
        'Không tìm thấy userName này trên hệ thống',
      );
    }
    // checking oldPassword === password.compare
    const isMatch = await bcrypt.compare(
      changePasswordUserdto.oldPassword,
      user.password,
    );
    // if not mathch, throw error
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }
    // else
    // Hash mật khẩu của user trước khi lưu vào database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      changePasswordUserdto.newPassword,
      salt,
    );
    // updatePassword in DB & Loggout user
    await this.usersService.updatePassword(userId, hashedPassword);
    // 4. Generate JWT tokens
    const payload = { username: user.username, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      message: 'Password updated',
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  // **** FUNCtION LOGOUT
  logout() {
    // clear refresh token của user trong database
    console.log('aba');
  }
}
