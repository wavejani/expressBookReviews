// File: router/auth_users.js

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Users array to store registered users
let users = [];

// Function to check if username is valid (i.e., not already taken)
const isValid = (username) => {
  // Check if the username is not empty and does not already exist
  const userExists = users.some((user) => user.username === username);
  return !userExists;
};

// Function to authenticate user credentials
const authenticatedUser = (username, password) => {
  // Check if the username and password match an existing user
  const validUser = users.find(
    (user) => user.username === username && user.password === password
  );
  return validUser !== undefined;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Validate user credentials
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    const accessToken = jwt.sign(
      { username: username },
      "fingerprint_customer", // Secret key should match the one used in index.js
      { expiresIn: '1h' }
    );

    // Save the token in the session
    req.session.authorization = {
      accessToken: accessToken
    };

    return res.status(200).json({ message: "User logged in successfully." });
  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;       // Get the ISBN from the URL parameters
  const review = req.query.review;    // Get the review from the query parameters
  const username = req.user.username; // Get the username from the authenticated user

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  // Check if the book exists
  if (books[isbn]) {
    // Add or modify the review
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/modified successfully." });
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// **Task 9: Delete a Book Review**
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;       // Get the ISBN from the URL parameters
  const username = req.user.username; // Get the username from the authenticated user

  // Check if the book exists
  if (books[isbn]) {
    // Check if the user has a review for this book
    if (books[isbn].reviews[username]) {
      // Delete the user's review
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully." });
    } else {
      // User has no review to delete
      return res.status(404).json({ message: "No review found to delete for this user." });
    }
  } else {
    // Book does not exist
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports = {
  authenticated: regd_users,
  isValid: isValid,
  users: users, // Export the users array
};
