const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
    
};

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

app.get("/", (req, res) => {
    res.end("Hello!");
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.post("/urls", (req, res) => {
    console.log(req.body);
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
    
});

app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id]
    };
    res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});