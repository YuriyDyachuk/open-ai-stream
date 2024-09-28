'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_ai_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      ai_thread_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      request_text: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      response_text: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      selected_prompt: {
        type: Sequelize.TEXT('short'),
        allowNull: true,
      },
      response_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_ai_requests');
  },
};
