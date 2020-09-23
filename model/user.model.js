/* 
Now we don’t want to store passwords in plain text because if an attacker manages to get access to the database, the password can be read so we want to avoid this. We’ll make use of a package called ‘bcrypt’ to hash user passwords and store them safely.

*/

const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
mongoose.Promise = global.Promise;
require('dotenv').config();


const {devboxdb: db }= require('../services/mongoose.connection');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});



/* 
Now we don’t want to store passwords in plain text because if an attacker manages to get access to the database, the password can be read so we want to avoid this. We’ll make use of a package called ‘bcrypt’ to hash user passwords and store them safely.

*/

//This is called a pre-hook, before the user information is saved in the database
//this function will be called, we'll get the plain text password, hash it and store it.
UserSchema.pre('save', async function (next) {
  //'this' refers to the current document about to be saved
  const user = this;
  //Hash the password with a salt round of 10, the higher the rounds the more secure, but the slower
  //your application becomes.
  const hash = await bcrypt.hash(this.password, 10);
  //Replace the plain text password with the hash and then store it
  this.password = hash;
  //Indicates we're done and moves on to the next middleware
  next();
});

//We'll use this later on to make sure that the user trying to log in has the correct credentials
UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  //Hashes the password sent by the user for login and checks if the hashed password stored in the
  //database matches the one sent. Returns true if it does else false.
  const compare = await bcrypt.compare(password, user.password);
  return compare;
}
console.log('test')
db.model('user', UserSchema);

module.exports = {
  schema:UserSchema,
  model:db.model('user')
}