/* 
Creating secure routes
Now lets create some secure routes that only users with verified tokens can access.
*/


const express = require('express');
const router = express.Router();

//Let's say the route below is very sensitive and we want only authorized users to have access

//Displays information tailored according to the logged in user
router.get('/profile', (req, res, next) => {
  //We'll just send back the user details and the token
  res.json({
    message : 'You made it to the secure route',
    user : req.user,
    token : req.query.secret_token
  })
});
router.get('/logout', (req, res) => {
  
  res.sendStatus(200);
});
module.exports = router;