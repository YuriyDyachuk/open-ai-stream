import * as process from 'node:process';

module.exports = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [],
  seederStorage: 'json',
  seederStoragePath: 'sequelizeData.json',
};
