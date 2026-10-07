import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Session } from '../../sessions/entities/session.entity.js';

@Entity({ name: 'users', schema: 'public' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @Column({ type: 'text' })
  name!: string | null;

  @Column({ type: 'text' })
  lastname!: string | null;

  @Column({ name: 'phone_number', type: 'text' })
  phoneNumber!: string;

  @OneToMany(() => Session, (s) => s.user)
  sessions!: Session[];
}
