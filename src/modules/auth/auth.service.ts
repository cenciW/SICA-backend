import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuarioService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.senha_hash))) {
      const { senha_hash, ...result } = user;
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
        name: user.nome_completo,
        role: user.role,
      },
    };
  }

  async register(userDto: any) {
    const createUsuarioDto = {
      email: userDto.email,
      usuario: userDto.email.split('@')[0], // Generate username from email
      senha: userDto.password,
      nome_completo: userDto.name,
      ativo: true,
    };
    return this.usuarioService.create(createUsuarioDto);
  }
}
