import { CommonEntity } from '@/common/entities/common.entity';
import { UserExchange } from '@/modules/user-exchange/models/user-exchange.entity';
import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('Exchange')
export class Exchange extends CommonEntity {
  @Column({
    comment: 'Exchange name, like Binance',
    length: 255,
    unique: true,
  })
  @IsNotEmpty()
  name: string;

  @OneToMany(() => UserExchange, (userExchange) => userExchange.exchange)
  userExchange: UserExchange[];
}
