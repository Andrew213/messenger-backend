import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { dataSourceOptions } from '@/database/ormconfig.js';
import { User } from '@/users/entities/user.entity.js';
import { UsersModule } from '@/users/users.module.js';

import { TestDB } from '../../test/config/typeorm-test.config.js';

describe('UserService integraion with PostgreSQL', () => {
  let repository: Repository<User>;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TestDB, UsersModule],
    }).compile();
    repository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should connect test db with test user', () => {
    expect(dataSourceOptions.database).toBe('messenger_test');
    expect(dataSourceOptions.username).toBe('messenger_test_user');
  });

  it('should create user', async () => {
    const testUser: DeepPartial<User> = {
      phoneNumber: '890000000000',
    };
    const newUser = repository.create(testUser);
    let userId: string | undefined;

    try {
      const savedUser = await repository.save(newUser);
      userId = savedUser.id;
      const user = await repository.findOneByOrFail({
        id: userId,
      });

      expect(user).toEqual(expect.objectContaining({ id: expect.any(String) }));
      expect(user.phoneNumber).toBe(testUser.phoneNumber);
    } finally {
      if (userId) {
        const isDeleted = await repository.delete(userId);
        expect(isDeleted.affected).toBe(1);
      }
    }
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });
});
