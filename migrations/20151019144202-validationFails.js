'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
        'user_accounts',
        'validation_fails',
        { type: Sequelize.INTEGER,
          defaultValue: 0
        }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
        'user_account',
        'validation_fails'
    )
  }
};
