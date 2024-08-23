const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const { username, password } = req.body; // Retrieve username and password from request body

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" }); // Error if username or password is missing
  }

  // Check if the username already exists
  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" }); // Error if username exists
  }

  // Register the new user
  users[username] = { password }; // Store the user with their password
  return res.status(201).json({ message: "User registered successfully" }); // Success message
});

// Async function to simulate fetching books from an external API or service
const fetchBooks = async () => {
  // Simulating async data retrieval, e.g., from a database or external API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books); // Simulate successful data retrieval
    }, 1000); // Simulate network delay
  });
};
// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const booksList = await fetchBooks(); // Fetch the books asynchronously
    res.json(booksList); // Send the fetched books as response
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// Simulate an external API or service for book details
const fetchBookDetails = async (isbn) => {
  // Simulating async data retrieval
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn]; // Simulate fetching from a local or remote source
      if (book) {
        resolve(book);
      } else {
        reject(new Error('Book not found'));
      }
    }, 1000); // Simulate network delay
  });
};

// Get book details based on ISBN using async/await and Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn; // Retrieve the ISBN from request parameters
  
  try {
    const book = await fetchBookDetails(isbn); // Fetch book details asynchronously
    return res.status(200).json(book); // Return the book details if found
  } catch (error) {
    console.error('Error fetching book details:', error);
    return res.status(404).json({ message: "Book not found" }); // Return an error if the book is not found
  }
});
  
// Simulate an external API or service for book details based on author
const fetchBooksByAuthor = async (author) => {
  // Simulating async data retrieval
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksByAuthor = []; // Array to hold books by the requested author

      // Iterate through the books object
      for (let key in books) {
        if (books[key].author === author) {
          booksByAuthor.push(books[key]);
        }
      }
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject(new Error('No books found by this author'));
      }
    }, 1000); // Simulate network delay
  });
};

// Get book details based on Author using async/await
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author; // Retrieve the author from request parameters

  try {
    const booksByAuthor = await fetchBooksByAuthor(author); // Fetch books by author asynchronously
    return res.status(200).json(booksByAuthor); // Return the books by the author if found
  } catch (error) {
    console.error('Error fetching books by author:', error);
    return res.status(404).json({ message: "No books found by this author" }); // Return an error if no books are found
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const title = req.params.title; // Retrieve the title from request parameters
    const booksByTitle = []; // Array to hold books with the requested title

    try {
      // Simulating an API call to fetch books data
      const response = await axios.get('http://localhost:5001/'); // Replace with your actual API endpoint
      const books = response.data;
  
      // Iterate through the books object
      for (let key in books) {
        if (books[key].title === title) {
          booksByTitle.push(books[key]);
        }
      }
  

    // Check if any books with the title were found
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle); // Return the books with the specified title
    } else {
      return res.status(404).json({ message: "No books found with this title" }); // Return an error if no books found
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while fetching books" }); // Return an error if something goes wrong
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from request parameters
  const book = books[isbn]; // Find the book by ISBN

  if (book) {
    return res.status(200).json(book.reviews); // Return the reviews if the book is found
  } else {
    return res.status(404).json({ message: "Book not found" }); // Return an error if the book is not found
  }
});

module.exports.general = public_users;
