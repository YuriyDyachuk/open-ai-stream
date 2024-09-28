import axios from 'axios';
import * as bcrypt from 'bcrypt';
import * as process from 'node:process';
import { ObjectLiteral } from '../types/types';

export const passwordToHash = (password: string): string => {
  const salt = bcrypt.genSaltSync(11);
  return bcrypt.hashSync(password, salt);
};

export const sendIoSystemMessage = async (
  user_id: number,
  message: ObjectLiteral,
) => {
  try {
    const SYS_AUTH = process.env.SYS_AUTH;
    await axios.post(
      'http://localhost:3000/api/io/system',
      {
        user_id,
        message,
      },
      {
        headers: {
          'x-sys-auth': SYS_AUTH,
        },
      },
    );
  } catch (e) {
    console.log(e);
  }
};