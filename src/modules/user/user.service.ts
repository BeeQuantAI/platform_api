import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './models/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // create a user
  async create(entity: DeepPartial<User>): Promise<User> {
    return await this.userRepository.save(this.userRepository.create(entity));
  }

  // delete an user
  async del(id: string): Promise<boolean> {
    const res = await this.userRepository.delete(id);
    return res.affected > 0;
  }

  // update a user
  async update(id: string, entity: DeepPartial<User>): Promise<boolean> {
    const found = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    this.userRepository.merge(found, entity);
    const res = await this.userRepository.save(found);

    if (res) {
      return true;
    }
  }

  // get all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // find a user by id
  async find(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  // find a user by email
  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
}
