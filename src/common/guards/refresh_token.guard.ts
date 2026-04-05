import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
// implements CanActivate là 1 interface bắt buộc, bất cứ guard hàm nào cũng phải có, nếu hàm này
// trả về true, req được đi tiếp, ngược lại thì req sẽ bị chặn lại và trả về lỗi UnauthorizedException
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy ra đối tượng request từ context , ta phải chỉ định là đang dùng HTTP
    const request = context.switchToHttp().getRequest();
    // Đây là hàm phụ trợ để lấy chuỗi token từ Header , nó tìm trong mục Authorization, thường có
    // dạng là Bearer <chuỗi_token>
    const token = this.extractTokenFromHeader(request);
    // Nếu không tìm thấy token nào trong header, trả về lỗi UnauthorizedException
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    request['refresh_token'] = token;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
