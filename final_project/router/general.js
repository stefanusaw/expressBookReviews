const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }

    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).send("Username already exists.");
    }

    const newUser = { username, password };
    users.push(newUser);

    return res.status(201).send("User registered successfully.");
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const allBooks = Object.values(books);
        return res.status(200).json(allBooks);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching the list of books', error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const bookDetails = books[isbn];
        if (bookDetails) {
            return res.status(200).json(bookDetails);
        } else {
            return res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error fetching book details', error: error.message });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    let author = req.params.author;

    try {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);

        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error fetching books by author', error: error.message });
    }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    let title = req.params.title;

    try {
        const bookOfTitle = Object.values(books).filter(book => book.title === title);

        if (bookOfTitle.length > 0) {
            return res.status(200).json(bookOfTitle);
        } else {
            return res.status(404).json({ message: "No books found by this title" });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error fetching books by title', error: error.message });
    }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book){
        res.send(book.reviews);
    } else {
        res.status(404).send("Book not found");
    }

});

module.exports.general = public_users;



