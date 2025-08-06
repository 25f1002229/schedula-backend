import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: { email: string; password: string; name: string; role: UserRole | string }) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.repo.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: (dto.role as string).toLowerCase() as UserRole, // Safe casting for enum
    });

    return this.repo.save(user);
  }

  async findByEmail(email: string) {
    return await this.repo.findOneBy({ email });
  }

  async findAllDoctors() {
    return await this.repo.find({ where: { role: UserRole.DOCTOR } });
  }
}
