'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bcrypt = require('bcrypt');
    return queryInterface.bulkInsert('users', [
      {
        name: 'Jon',
        surname: 'Doe',
        email: 'jon-doe@gmail.com',
        password: bcrypt.hashSync(
          '12345678',
          bcrypt.genSaltSync(10),
        ),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  },
};


