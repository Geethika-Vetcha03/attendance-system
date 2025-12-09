import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');
    const hash = await bcrypt.hash(dto.password, 10);
    // Handle empty classId - convert empty string to null
    const userData = { ...dto, password: hash };
    if (!userData.classId || userData.classId === '') {
      delete userData.classId;
    }
    const user = this.userRepo.create(userData);
    await this.userRepo.save(user);
    return { message: 'User registered successfully', user: { id: user.id, name: user.name, classId: user.classId } };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload), user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ 
      where: { id: userId }, 
      relations: ['class'],
      select: ['id', 'email', 'name', 'role', 'phone', 'classId', 'createdAt']
    });
    return user;
  }
}
