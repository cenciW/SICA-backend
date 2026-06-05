import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
    };
  }

  async register(userDto: any) {
    const created = await this.userService.create({
      email: userDto.email,
      username: userDto.email.split('@')[0],
      password: userDto.password,
      full_name: userDto.name,
      active: true,
    });

    const payload = { email: created.email, sub: created.id, role: Role.USER };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: created.id,
        email: created.email,
        name: created.full_name,
        role: Role.USER,
      },
    };
  }
}
