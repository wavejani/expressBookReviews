// File: index.js

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configure session middleware
app.use(session({
  secret: "fingerprint_customer", // Secret key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure to false for HTTP (set to true in production with HTTPS)
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    // Retrieve the token from the session
    const token = req.session.authorization.accessToken;

    // Verify the token
    jwt.verify(token, "fingerprint_customer", (err, user) => {
      if (err) {
        // Invalid token
        return res.status(403).json({ message: "User not authenticated." });
      }
      // Attach user information to the request
      req.user = user;
      next();
    });
  } else {
    // No token found in session
    return res.status(401).json({ message: "Unauthorized: No session token found" });
  }
});

// Use customer and general routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
