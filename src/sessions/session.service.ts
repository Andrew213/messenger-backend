import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session } from '@/sessions/entities/session.entity.js';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly SessionRepository: Repository<Session>,
  ) {}
  async createSession() {}
}
