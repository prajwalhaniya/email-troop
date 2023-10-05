const { Model } = require('sequelize');

module.exports = (sequelize, Datatypes) => {
    class sample extends Model {
        static associate(models) {
        }
    }
    sample.init(
        {
            id: {
                type: Datatypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Datatypes.STRING(50),
            },
            subject: {
                type: Datatypes.STRING(50),
            },
        },
        {
            sequelize,
            modelName: 'sample',
        }
    );
    return sample;
};
