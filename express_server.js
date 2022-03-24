const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const e = require("express");

app.set("view engine", "ejs");

// middleware:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "u_94x92": {
    id: "u_94x92",
    email: "a@test.ca",
    password: "hi"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// routes:

app.get("/", (req, res) => {
  res.send("Hi there!");
});

// homepage
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  console.log(users[user_id]);

  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };

  res.render("urls_index", templateVars);
});

// registration
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  console.log(user_id);
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  console.log(users);
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const userEnteredEmail = req.body.email;
  const userEnteredPassword = req.body.password;
  const randUserID = 'u_' + generateRandomString();

  if (!userEnteredEmail) {
    return res.error(404).send("The email entered cannot be empty.");
  }
  if (!userEnteredPassword) {
    return res.status(404).send("The password entered cannot be empty.");
  }

  if (emailCheck(users, userEnteredEmail)) {
    return res.status(400).send("The email entered already exists. Please enter a new email address.");
  }

  users[randUserID] = {
    id: randUserID,
    email: userEnteredEmail,
    password: userEnteredPassword
  };
  console.log('user created for ', randUserID);
  console.log(users);

  res.cookie("user_id", randUserID).redirect("/urls");

});

// login
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: undefined
  };
  res.render("urls_login", templateVars);

});

app.post("/login", (req, res) => {
  const userEnteredEmail = req.body.email;
  const userEnteredPassword = req.body.password;
  const user_id = emailCheck(users, userEnteredEmail)

  if(user_id) {
    if (users[user_id].email === userEnteredEmail && users[user_id].password == userEnteredPassword) {
      res.cookie("user_id", user_id).redirect("/urls");
    } else {
      return res.status(403).send("The email and password entered do not match. Please try again.");
    }
  } else {
    return res.status(403).send("Email cannot be found. Please enter a valid email address.")
  }

});

// logout
app.post("/logout", (req, res) => {
  const user_id = req.cookies["user_id"];
  console.log('logged out user');
  res.clearCookie("user_id", res.cookie.user).redirect("/urls");
});

// create new shortURL
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];

  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = 'http://' + req.body.longURL;
  console.log(`New short url created: ${newShortURL} for ${req.body.longURL}`);
  res.redirect(`/urls/${newShortURL}`);
});


// update existing shortURL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = 'http://' + req.body.longURL;
  console.log(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

// redirecting shortLink
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(`Redirecting to: ${longURL}`);
  res.redirect(longURL);
});

// delete existing shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('deleting');

  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  console.log('new database: ', urlDatabase);
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

function generateRandomString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = 6;
  let randStr = '';

  for (let x = 0; x < charLength; x++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return randStr;
}

function emailCheck(users, email) {
  for (let user in users) {
    console.log(users[user].email);
    if (users[user].email === email) {
      return user;
    }
  }
}

function findUserId(users, userEnteredEmail) {

}