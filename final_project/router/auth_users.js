const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secretKey = 'your_jwt_secret';

const isValid = (username)=>{ //returns boolean
  console.log('Checking username validity:', username);
// Check if username exists in users
return users.hasOwnProperty(username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
// Check if username and password match
return users[username] && users[username].password === password;
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body; // Retrieve username and password from request body

  console.log('Login attempt:', { username, password });

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" }); // Error if username or password is missing
    }

    if (!isValid(username)) {
      console.log('Username not found:', username);
        return res.status(401).json({ message: "Invalid username" }); // Error if username is invalid
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid password" }); // Error if password is invalid
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    
    req.session.token = token;
    console.log('Session after login:', req.session);

    return res.status(200).json({ message: "Login successful", token }); // Success message with token
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.query;
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const username = decoded.username;
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add or modify the review
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified successfully" });
  });
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.session.token;
  
    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
  
      const username = decoded.username;
      const book = books[isbn];
  
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      if (!book.reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
      }
  
      // Delete the review
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
