'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
        'user_privacy',
        'nickName',
        { type: Sequelize.ENUM('public','friends','private'),
            defaultValue: 'public'
        }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
        'user_privacy',
        'nickName'
    );
  }
};
