const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./router/booksdb.js');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const secretKey = 'your_jwt_secret';

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){

  console.log('Session in auth middleware:', req.session);
// Check if the user has an access token in the session
  if (!req.session.token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(req.session.token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Token is valid, proceed to the next middleware or route
    req.user = decoded; // Attach user info to the request object
    next();
  });
});
 


app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT =5001;
app.listen(PORT,()=>console.log("Server is running"));
