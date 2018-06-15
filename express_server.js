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

    const userID = req.cookies.user_id;
    const user = users[userID];

    let templateVars = {
        urls: urlDatabase,
        user: user
     };
    res.render("urls_index", templateVars);
});

//site user enters LongURL
app.get("/urls/new", (req, res) => {
    const userID = req.cookies.user_id;
    const user = users[userID];
    let templateVars = { user: user };
    res.render("urls_new", templateVars);
});

//get LongURL -> create shortURL and store in data -> redirect to site /urls
app.post("/urls/", (req, res) => {
    if (!req.cookies.user_id) {
        res.redirect("/login");
    } else {
        let shortURL = generateRandomString();
        let longURL = req.body.longURL;
        let userID = req.cookies.user_id;
        urlDatabase[userID][shortURL] = longURL;
        console.log(urlDatabase);
        res.redirect("/urls");
    }
});


app.get("/urls/:id", (req, res) => {
    const userID = req.cookies.user_id;
    const user = users[userID];
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        user: user
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
function validData(data) {
    if (data.email && data.email.length > 0 && data.password && data.password.length > 0 && data.email) {
        for (let existusers in users) {
            if (data.email === users[existusers].email) {
                return false;
            }
        }
        return true;
    }
    return false;
}

app.get("/register", (req,res) => {
    res.render("urls_registration");
});

app.post("/register", (req, res) => {
    const valid = validData(req.body);
    if (valid) {
        id = generateRandomString();
        users[id] = {
            id: id,
            email: req.body.email,
            password: req.body.password
        }
        res.cookie('user_id', users[id].id);
        console.log(users);
        res.redirect("/urls");
    } else {
        //error and set statuscode = 400;
        res.sendStatus(400);
    }
});

//Login Page relate:
app.get('/login', (req, res) => {
    res.render("urls_login");
});

function authenticateUser(email, password){
    var flag = false;
    for (let userID in users) {
        if (users[userID].email === email) {
            if (users[userID].password === password) {
                console.log("user id and password matched");
                return users[userID];
            }
            else {
                flag = true;
            }
        }
    }
    if(flag){
        console.log("user does not matched");
    }
}
app.post('/login', (req,res) => {
    const loginEmail = req.body.email;
    const loginPassword = req.body.password;
    var result = authenticateUser(loginEmail, loginPassword);
    if(result){
        res.cookie('user_id', result.id)
        res.redirect("/urls");
    }else{
        res.sendStatus(403);
    }
});

//user log out
app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect("/urls");
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});