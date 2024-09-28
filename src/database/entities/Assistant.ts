import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { DateEntityType } from '../../types/types';

@Table({
  tableName: 'assistants',
})
export class Assistant extends Model<Assistant> {
  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  user_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  assistant_id?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  vector_store_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  thread_id?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  model?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  instructions?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  tools?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  metadata?: string;

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
