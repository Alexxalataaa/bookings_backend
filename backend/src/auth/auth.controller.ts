import { Body, Controller, Post, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Obtener perfil del usuario' })
  async getProfile(@Req() req: any) {
    const user = await this.authService.getUserById(req.user.userId);
    return {
      id: user.id,
      username: user.username,
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
