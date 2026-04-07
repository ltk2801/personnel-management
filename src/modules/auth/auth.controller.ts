import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/auth-register.dto';
import { LoginUserDto } from './dto/auth-login.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ChangePasswordUserDto } from './dto/auth-change-password.dto';
import { GuestGuard } from 'src/common/guards/guest.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh_token.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register
  @ApiOperation({ summary: 'Dang ky tai khoan moi' })
  @ApiBody({ type: RegisterUserDto })
  @ApiOkResponse({ description: 'Dang ky thanh cong' })
  @HttpCode(HttpStatus.OK) // Đặt mã trạng thái HTTP trả về là 200 OK thay vì 201 Created
  @Post('register')
  @UseGuards(GuestGuard)
  create(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.registerUser(RegisterUserDto);
  }
  // Login
  @ApiOperation({ summary: 'Dang nhap va nhan access token, refresh token' })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({ description: 'Dang nhap thanh cong' })
  @ApiUnauthorizedResponse({ description: 'Thong tin dang nhap khong hop le' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(GuestGuard)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signIn(loginUserDto);
  }

  // Refresh Token
  @ApiOperation({ summary: 'Cap lai bo token moi tu refresh token' })
  @ApiOkResponse({ description: 'Lam moi token thanh cong' })
  @ApiUnauthorizedResponse({ description: 'Refresh token khong hop le' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.refresh_token);
  }

  // Get profile, bao ve route nay bang Authguard, chi nhung request co token hop le moi duoc lay profile
  @ApiOperation({ summary: 'Lay thong tin profile cua user dang dang nhap' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Lay profile thanh cong' })
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@GetUser() user: any) {
    return this.authService.getProfile(user.sub); // Thông tin user đã được đính kèm vào request trong AuthGuard (Su dung decorator)
  }

  // Logout
  @ApiOperation({ summary: 'Dang xuat va xoa refresh token hien tai' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Dang xuat thanh cong' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(AuthGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép logout
  async logout(@Request() req) {
    // Lấy userId từ thông tin user đã được đính kèm vào request trong AuthGuard
    return await this.authService.logout(req.user.sub);
  }

  // ChangePassword
  @ApiOperation({ summary: 'Doi mat khau cho user dang dang nhap' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: ChangePasswordUserDto })
  @ApiOkResponse({ description: 'Doi mat khau thanh cong' })
  @UseGuards(AuthGuard)
  @Patch('changePassword')
  async changePassword(
    @Request() req,
    @Body() changePasswordUserDto: ChangePasswordUserDto,
  ) {
    const userId = req.user.sub; // lấy userId từ thông tin user được đính kèm vào request
    return await this.authService.changePassword(userId, changePasswordUserDto);
  }
}
