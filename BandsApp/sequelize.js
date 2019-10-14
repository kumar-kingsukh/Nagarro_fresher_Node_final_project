const Sequelize = require('sequelize')
const UserModel = require('./models/user')
const BandModel = require('./models/band')

const sequelize = new Sequelize('test', 'root', '', {
  dialect: 'sqlite',
  storage: './db.sqlite3'
})

const User = UserModel(sequelize, Sequelize)
const Band = BandModel(sequelize, Sequelize)
Band.belongsTo(User);
User.hasMany(Band);

sequelize.sync().then(() => console.log("Synced"))

module.exports = {
  User,
  Band
}