'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('user_privacy','homeTown','homeTownId');
    /*
     Add altering commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('user_privacy', 'homeTownId','homeTown');
    /*
     Add reverting commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.dropTable('users');
     */
  }
};
