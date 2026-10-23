import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { User } from '@/users/entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async findByPhoneNumer(phoneNumber: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(User)
      : this.usersRepository;
    const user = await repository.findOneBy({ phoneNumber });
    return user?.id;
  }
  async getUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user?.id,
    };
  }

  async createUser(phoneNumber: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(User)
      : this.usersRepository;
    const newUser = repository.create({ phoneNumber });

    const savedUser = await repository.save(newUser);

    return savedUser.id;
  }
}
