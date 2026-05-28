import { Body, Controller, Post, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { AuthGuard } from './auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({ description: 'Login de admin' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @Post('verify-register')
  @ApiCreatedResponse({ description: 'Verificar código de confirmación de registro' })
  verifyRegister(@Body() body: Verify2faDto) {
    return this.authService.verifyRegister(body.tempToken, body.code);
  }

  @Post('register')
  @ApiCreatedResponse({ description: 'Registro de usuario exitoso' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.fullName, body.email, body.username, body.password, body.role);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Obtener perfil del usuario' })
  async getProfile(@Req() req: any) {
    const user = await this.authService.getUserById(req.user.userId);
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Actualizar perfil del usuario' })
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId, body.username, body.password);
  }
}
