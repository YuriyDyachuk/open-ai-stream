import {
  Model,
  Table,
  Column,
  DataType
} from 'sequelize-typescript';

import { AuthUser } from '../../types/interfaces';
import { DateEntityType } from '../../types/types';

@Table({
  tableName: 'users',
  defaultScope: {
    attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
  },
})
export class User extends Model<User> implements AuthUser{
  @Column({
    type: DataType.NUMBER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  surname: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  time_zone: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  createdAt: DateEntityType;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  updatedAt: DateEntityType;
}