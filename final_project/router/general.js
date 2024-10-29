// File: router/general.js

const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js"); // Import isValid and users
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the user already exists
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Add the new user
  users.push({ username: username, password: password });
  return res.status(201).json({ message: "User registered successfully." });
});

// **New Route: Get the book list available in the shop via /books endpoint**
public_users.get('/books', function (req, res) {
  res.status(200).json(books);
});

// **New Route: Get book details based on ISBN via /books/:isbn endpoint**
public_users.get('/books/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// **New Route: Get book details based on Author via /books/author/:author endpoint**
public_users.get('/books/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  const isbnKeys = Object.keys(books);

  isbnKeys.forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push({ isbn: isbn, ...books[isbn] });
    }
  });

  if (booksByAuthor.length > 0) {
    res.status(200).json(booksByAuthor);
  } else {
    res.status(404).json({ message: "No books found by the specified author" });
  }
});

// **New Route: Get book details based on Title via /books/title/:title endpoint**
public_users.get('/books/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  const isbnKeys = Object.keys(books);

  isbnKeys.forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle.push({ isbn: isbn, ...books[isbn] });
    }
  });

  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: "No books found with the specified title" });
  }
});

// **Modified Route: Get the book list available in the shop using Async-Await with Axios**
public_users.get('/', async function (req, res) {
  try {
    console.log("Initiating Axios request to /books");
    // Make an internal HTTP GET request to the /books endpoint using Axios
    const response = await axios.get('http://localhost:5000/books');

    console.log("Axios request successful");
    // Send the fetched books data as the response
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ message: "Error fetching books." });
  }
});

// **Refactored Route: Get book details based on ISBN using Async-Await with Axios**
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    console.log(`Initiating Axios request to /books/${isbn}`);
    // Make an internal HTTP GET request to the /books/:isbn endpoint using Axios
    const response = await axios.get(`http://localhost:5000/books/${isbn}`);

    console.log(`Axios request successful for ISBN: ${isbn}`);
    // Send the fetched book data as the response
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "Book not found" });
    } else {
      console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
      res.status(500).json({ message: "Error fetching book details." });
    }
  }
});

// **Refactored Route: Get book details based on Author using Async-Await with Axios**
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    console.log(`Initiating Axios request to /books/author/${author}`);
    // Make an internal HTTP GET request to the /books/author/:author endpoint using Axios
    const response = await axios.get(`http://localhost:5000/books/author/${encodeURIComponent(author)}`);

    console.log(`Axios request successful for author: ${author}`);
    // Send the fetched books data as the response
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "No books found by the specified author" });
    } else {
      console.error(`Error fetching books by author ${author}:`, error.message);
      res.status(500).json({ message: "Error fetching books by author." });
    }
  }
});

// **Refactored Route: Get book details based on Title using Async-Await with Axios**
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    console.log(`Initiating Axios request to /books/title/${title}`);
    // Make an internal HTTP GET request to the /books/title/:title endpoint using Axios
    const response = await axios.get(`http://localhost:5000/books/title/${encodeURIComponent(title)}`);

    console.log(`Axios request successful for title: ${title}`);
    // Send the fetched books data as the response
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "No books found with the specified title" });
    } else {
      console.error(`Error fetching books with title ${title}:`, error.message);
      res.status(500).json({ message: "Error fetching books by title." });
    }
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  const isbnKeys = Object.keys(books);

  isbnKeys.forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle.push({ isbn: isbn, ...books[isbn] });
    }
  });

  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: "No books found with the specified title" });
  }
});

// Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    const reviews = book.reviews;
    res.status(200).json(reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
