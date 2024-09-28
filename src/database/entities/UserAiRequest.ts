import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { DateEntityType } from '../../types/types';

@Table({
  tableName: 'user_ai_requests',
})
export class UserAiRequest extends Model<UserAiRequest> {
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  user_id?: number;
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  persona_id?: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  status?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  ai_thread_id?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  selected_prompt?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  request_text?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  response_text?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  response_time?: string;

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
