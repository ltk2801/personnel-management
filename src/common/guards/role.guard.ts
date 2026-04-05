import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const upperCaseRoles = requiredRoles.map((role) => role.toUpperCase());
    const hasPermission = upperCaseRoles.includes(user.role);

    if (!hasPermission) {
      // Tùy chỉnh message ở đây
      throw new ForbiddenException({
        statusCode: 403,
        message: `Bạn không có quyền truy cập. Yêu cầu quyền: [${requiredRoles.join(', ')}]`,
        error: 'Forbidden',
      });
    }

    return true;
  }
}
