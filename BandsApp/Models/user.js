module.exports = (sequelize, type) => {
    return sequelize.define('user', {
        id: {
            type: type.BIGINT,
            primaryKey: true,
            autoIncrement: true
          },
        name: type.STRING,
        email: type.STRING,
        password: type.STRING,
        company:type.STRING,
        dateOfBirth:type.DATE
      
    })
}