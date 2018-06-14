const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

//url database: supposed, each shortened URL associate with the long URL
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",

};

//user database: each userID associate with id, email and password
const users = {
  "0081sb": {
    id: "0081sbd",
    email: "jame@happy.com",
    password: "purple-monkey-dinosaur"
  },
 "92hdsl": {
    id: "92hdsl",
    email: "yumy@example.com",
    password: "dishwasher-funk"
  }
}

// generate random shortened url name for the website user presented
function generateRandomString() {
    const possible = "qwertyuioplkjhgfdsazxcvbnm1234567890";
    const shortenedName = [];
    for (let i = 0; i < 6; i++) {
        shortenedName.push(possible[Math.floor(Math.random() * possible.length)]);
    }
    return (shortenedName.join(""));
}


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

//initial test of the server
app.get("/", (req, res) => {
    res.end("Hello!");
});

//site shows all the ShortURL -> LongURL
app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
     };
    res.render("urls_index", templateVars);
});

//site user enters LongURL
app.get("/urls/new", (req, res) => {
    let templateVars = { username: req.cookies["username"] };
    res.render("urls_new", templateVars);
});

//get LongURL -> create shortURL and store in data -> redirect to site /urls
app.post("/urls/", (req, res) => {
    console.log(req.body);
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
});


app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req,res) => {
    const shortURL = req.params.id;
    const longURL = req.body.longURL
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
});


app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);

});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

//use POST to delete unwanted shortURL
app.post("/urls/:id/delete",(req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

//user registration
app.get("/register", (req,res) => {
    let templateVars = { username: req.cookies["username"] };
    res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
    users[generateRandomString()] = {
        id: generateRandomString(),
        email: req.body.email,
        password: req.body.password
    }
    res.redirect("/urls");
});
//username created, and stored in cookies
app.post("/login", (req, res) => {
    res.cookie('username', req.body.username);
    res.redirect("/urls");
})

//username log out
app.post("/logout", (req, res) => {
    res.clearCookie('username');
    res.redirect("/urls");
});

//practice//
app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});