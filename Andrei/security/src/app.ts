import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import passport from 'passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import cookieSession from 'cookie-session';
import User from './models/User';

passport.use(
  new Strategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.DOMAIN! + '/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile); // this user will passed to passport.serializeUser() and req.user
    }
  )
);
// save the session in the cookie
passport.serializeUser((profile, done) => {
  done(null, profile); // this user will passed to passport.deserializeUser() 
});
// read the session from the cookie
passport.deserializeUser((profile: Profile, done) => {
  const { id, emails, photos } = profile;
  const user: User = {
    id,
    email: emails ? emails[0].value : '',
    imgUrl: photos ? photos[0].value : '',
  };
  done(null, user); // this will go to req.user
});

const app = express();
app.use(helmet());
app.use(cookieSession({
  name: 'session',
  maxAge: +process.env.COOKIE_MAX_AGE!, 
  keys: [process.env.COOKIE_KEY1!, process.env.COOKIE_KEY2!],
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.get('/auth/google', passport.authenticate('google', { scope: ['email'] }));
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login-failure',
    successRedirect: '/', // if not specify it will stay at /auth/google/callback
    // session: false, // default is true
  }),
  // this callback can be obmitted or used to redirect to a success page with token as a query parameter to do JWT (however, session still be involked anyway. That is why once we use passport we often use session-based authentication)
  (req, res) => { 
    res.send('failed to redirect because redirect url is not specified');
  }
);
app.get('/auth/login-failure', (req, res) => {
  res.status(200).json({
    message: 'Failed to loggin with google',
  });
});
app.get('/auth/logout', (req, res) => {
  req.logout();
  // res.cookie('session', '', { maxAge: 0 }); // delete the cookie
  // res.cookie('session.sig', '', { maxAge: 0 });
  res.redirect('/');
});
app.get('/secret', checkLoggedIn, (req, res) => {
  // we can pass as many middlewares as we want for every single route, just separate them with a comma
  const user = req.user as User;
  res.send(`
    <h1>Hello ${user.email}</h1>
    <img src="${user.imgUrl}" />
  `);
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/index.html'));
});

export default app;

function checkLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) { // isAuthenticated() is from passport which basically checks if req.user is truthy or not
    return res.status(401).json({
      error: {
        message: 'You are not logged in',
      },
    });
  }
  next();
}
