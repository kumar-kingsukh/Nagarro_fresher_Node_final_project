module.exports = (sequelize, type) => {
    return sequelize.define('band', {
        id: {
          type: type.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        
        },
        name: type.STRING,
        description:type.STRING
    })
}   