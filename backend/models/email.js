const { Model } = require('sequelize');

module.exports = (sequelize, Datatypes) => {
    class email extends Model {
        // static associate(models) {
        // }
    }
    email.init(
        {
            id: {
                type: Datatypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },
            mailId: {
                type: Datatypes.INTEGER,
                unique: true,
                allowNull: false,
            },
            from: {
                type: Datatypes.STRING(500),
                allowNull: true,
                defaultValue: null,
            },
            to: {
                type: Datatypes.STRING(1000),
                allowNull: true,
                defaultValue: null,
            },
            message: {
                type: Datatypes.TEXT,
                allowNull: true,
                defaultValue: null,
            },
            subject: {
                type: Datatypes.TEXT,
                allowNull: true,
                defaultValue: null,
            },
            cc: {
                type: Datatypes.STRING(1000),
                allowNull: true,
                defaultValue: null,
            },
            date: {
                type: Datatypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            modelName: 'email',
        }
    );
    return email;
};
