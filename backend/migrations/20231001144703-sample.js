'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('samples', 'subject', {
            type: Sequelize.DataTypes.STRING(50),
            after: 'name'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('samples', 'subject');
    }
};
