const { Model } = require('sequelize');

module.exports = (sequelize, Datatypes) => {
    class unique_email extends Model {
        static associate() {}
    }
    unique_email.init(
        {
            id: {
                type: Datatypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: Datatypes.STRING(500),
                unique: true,
                allowNull: false,
            },
            email_date: {
                type: Datatypes.STRING,
                allowNull: true,
                defaultValue: null,
            }
        },
        {
            sequelize,
            modelName: 'unique_email',
        }
    );
    return unique_email;
};
