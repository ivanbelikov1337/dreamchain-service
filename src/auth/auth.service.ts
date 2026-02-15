import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(walletAddress: string) {
    let user = await this.usersService.findByWalletAddress(walletAddress);

    if (!user) {
      user = await this.usersService.create({
        walletAddress,
      } as CreateUserDto);
    }

    if (!user) {
      throw new Error('Failed to create or find user');
    }

    const payload = { sub: user.id, walletAddress: user.walletAddress };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      return null;
    }
  }
}
