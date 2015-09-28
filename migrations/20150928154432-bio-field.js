'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
        'user_profiles',
        'bio',
        { allowNull: true, type: Sequelize.TEXT }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
        'user_profile',
        'bio'
    );
  }
};
