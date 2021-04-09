const passport = require('passport');
const fetch = require('node-fetch');
const db = require('../Models/ParkingSpotModels');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Data } = require('@react-google-maps/api');

//in case of a serialization issue with user on login or sign up (place in file where user was created)
 passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // User.findById(id, function(err, user) {
  //   done(err, user);
  // });
    done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.SERVER_CLIENT_ID,
  clientSecret: process.env.SERVER_CLIENT_SECRET,
  callbackURL: "/auth/google/oauthtg",
  //possibly not needed
  // userProfileURL: "http://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, done) {
    // console.log('Google function' , profile.name, profile.emails);
    // console.log('Google function' , profile.name, profile.emails[0].value);
  // User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //   return done(err, user);
  // })
  const queryStr = `SELECT count(1) FROM "public"."Users" WHERE email = '${profile.emails[0].value}';`;
  db.query(queryStr)
  .then(data => {
    if (data.rows[0].count === 1) {
      // console.log('this is data', data.rows[0].count);
      profile = data.rows;
    } else {
      const searchStr = `INSERT INTO "public"."Users" (first_name, last_name, email, password, id_role)
      VALUES ('${profile.name.givenName}', '${profile.name.familyName}', '${profile.emails[0].value}', 'somethingstupid', 1) RETURNING *`
      db.query(searchStr)
      .then(data => {
        profile = data.rows;
      })
    }

   
  })
  .catch(err => 'error in passport setup fetch req')
  // res.locals.user = profile;
  return done(null, profile);
}
));
