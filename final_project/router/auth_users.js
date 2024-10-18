const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const user = users.find(user => user.username === username);
    return !user;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    const user = users.find(user => user.username === username && user.password === password);
    return !!user;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (!isValid(username) || !authenticatedUser(username, password)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful', token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const username = decoded.username;
        const { review } = req.query;
        const { isbn } = req.params;

        if (!review) {
            return res.status(400).json({ message: 'Review is required' });
        }

        if (!books[isbn]) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        books[isbn].reviews[username] = review;

        return res.status(200).json({ message: 'Review added/modified successfully' });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const username = decoded.username;
        const { isbn } = req.params;

        if (!books[isbn]) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: 'Review not found' });
        }

        delete books[isbn].reviews[username];

        return res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;