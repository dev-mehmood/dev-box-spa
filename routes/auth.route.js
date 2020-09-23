
/**
 * Creating the Routes
    Now that we have middleware for handling registration and login, let’s create routes that’ll use this middleware.
 */
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
var jwt_ = require('express-jwt');
// var blacklist = require('express-jwt-blacklist');
const router = express.Router();

//When the user sends a post request to this route, passport authenticates the user based on the
//middleware created previously
// router.post('/signup', ()=>{
//   console.log('test')
// })
router.post('/signup', passport.authenticate('signup', { session: false }), async (req, res, next) => {
  res.json({
    message: 'Signup successful',
    user: req.user
  });
});

/**
Signing the JWT
When the user logs in, the user information is passed to our custom callback which in
turn creates a secure token with the information. This token is then required to be passed along as a query parameter when accessing secure routes(which we’ll create later).
 */
router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error('An Error occurred')
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error)
        //We don't want to store the sensitive information such as the
        //user password in the token so we pick only the email and id
        const body = { _id: user._id, email: user.email };
        //Sign the JWT token and populate the payload with the user email and id
        const token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365),
          user: body }, process.env.PASSPORT_SECRET);
        //Send back the token to the user
        // optionally we can set token in the cookie
        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});



module.exports = router;