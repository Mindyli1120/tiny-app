const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcryptjs = require('bcryptjs');



//url database: supposed, each shortened URL associate with the long URL
const urlDatabase = {
    'hahaha': {
        userID: "hahaha",
        shortURL: "b2xVn2",
        longURL: "http://www.lighthouselabs.ca"
    },
    'examp2': {
        userID: "examp2",
        shortURL: "9sm5xK",
        longURL: "http://www.google.com"
    }
};

//user database: each userID associate with id, email and password
const users = {
  "0081sb": {
    id: "0081sbd",
    email: "jame@happy.com",
    hashedPassword: "purple-monkey-dinosaur"
  },
 "92hdsl": {
    id: "92hdsl",
    email: "yumy@example.com",
    hashedPassword: "dishwasher-funk"
  }
};

// generate random shortened url name for the website user presented
function generateRandomString() {
    const possible = "qwertyuioplkjhgfdsazxcvbnm1234567890";
    const shortenedName = [];
    for (let i = 0; i < 6; i++) {
        shortenedName.push(possible[Math.floor(Math.random() * possible.length)]);
    }
    return (shortenedName.join(""));
};


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['hel980'],
}));


//site shows user's the ShortURL -> LongURL
function urlsForUser(id) {
    const usersURL = {};
    for (const url in urlDatabase) {
        if (urlDatabase[url].userID === id) {
            let shortURL = urlDatabase[url].shortURL;
            let longURL = urlDatabase[url].longURL;
            usersURL[shortURL] = longURL;
        }
    }
    return usersURL;
};

app.get("/urls", (req, res) => {
    const userID = req.session.user_id;
    const user = users[userID];

    const usersURL = urlsForUser(userID);
    let templateVars = {
        urls: usersURL,
        user: user
     };
    res.render("urls_index", templateVars);
});

//site user enters LongURL
app.get("/urls/new", (req, res) => {
    const userID = req.session.user_id;
    const user = users[userID];
    let templateVars = { user: user };
    res.render("urls_new", templateVars);
});

//get LongURL -> create shortURL and store in data -> redirect to site /urls
app.post("/urls/", (req, res) => {
    if (!req.session.user_id) {
        res.redirect("/login");
    } else {
        let shortURL = generateRandomString();
        let longURL = req.body.longURL;
        let userID = req.session.user_id;
        urlDatabase[shortURL] = {
            userID: userID,
            shortURL: shortURL,
            longURL: longURL
        };
        res.redirect("/urls");
    }
});

//be able to detect whether the shortURL is belong to the user
function correctShrtURL(shortURL,userID) {
    for (const shrt in urlDatabase) {
        if ( shortURL === urlDatabase[shrt].shortURL && userID === urlDatabase[shrt].userID) {
            return true;
        }
    }
    return false;
}

//Update the of URL
app.get("/urls/:id", (req, res) => {
    const userID = req.session.user_id;
    const user = users[userID];
    const shortURL = req.params.id;
    const correct = correctShrtURL(shortURL, userID);
    if (userID === undefined) {
        res.redirect("/login");
        return;
    }
    if (correct) {
        let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: user
        };
        res.render("urls_show", templateVars);
    } else {
        res.send("Sorry! The short URL is wrong!");
    }

});

app.post("/urls/:id/update", (req,res) => {
    const shortURL = req.params.id;
    const longURL = req.body.longURL
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
});

//redirect to the websites
app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id].longURL;
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
            hashedPassword: bcryptjs.hashSync(req.body.password, 10)
        };
        req.session.user_id = users[id].id;
        res.redirect("/urls");
    } else {
        //error and set statuscode = 400;
        res.sendStatus(400);
    }
});

//Login:
app.get('/login', (req, res) => {
    res.render("urls_login");
});

function authenticateUser(email, password){
    for (let userID in users) {
        if (users[userID].email === email) {
            if (bcryptjs.compareSync(password, users[userID].hashedPassword)) {
                return users[userID];
            }

        }
    }
}
app.post('/login', (req,res) => {
    const userID = req.session.user_id;
    const loginEmail = req.body.email;
    const loginPassword = req.body.password;
    const result = authenticateUser(loginEmail, loginPassword);
    if(result){
        req.session.user_id = users[id].id;
        res.redirect("/urls");
    }else{
        res.sendStatus(403);
    }
});

//user log out
app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});