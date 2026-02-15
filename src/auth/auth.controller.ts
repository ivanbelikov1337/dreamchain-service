import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { walletAddress: string }) {
    return this.authService.signIn(body.walletAddress)
  }

  @Post('verify')
  async verify(@Body() body: { token: string }) {
    const payload = await this.authService.verifyToken(body.token)
    return { valid: !!payload }
  }
}
