const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs"); 

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

// middleware:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "u_94x92": {
    id: "u_94x92",
    email: "a@test.ca",
    password: bcrypt.hashSync("hi", 10)
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
    },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  hf43nj: {
    longURL: "https://www.facebook.com",
    userID: "u_94x92"
  },
  kf932d: {
    longURL: "https://www.example.edu",
    userID: "u_94x92"
  }
};

// routes:

app.get("/", (req, res) => {
  res.send("Hi there!");
});

// access denied: not logged in

app.get("/access_denied", (req, res) => {
  const templateVars = {
    user: undefined
  };
  res.render("urls_accessDenied", templateVars);
})

// homepage
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];

  if (!user_id) {
    return res.redirect("/access_denied");
  }

  const templateVars = {
    urls: userURLS(urlDatabase, user_id),
    user: users[user_id]
  };

  res.render("urls_index", templateVars);
});

// registration
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  console.log("Registered user:", user_id);
  const templateVars = {
    user: users[user_id]
  };
  console.log("Existing users:", users);
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const userEnteredEmail = req.body.email;
  const userEnteredPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userEnteredPassword, 10);
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
    password: hashedPassword
  };
  console.log('New user registered:', randUserID);
  console.log('Existing users in database:', users);

  res.cookie("user_id", randUserID).redirect("/urls");

});

// login
app.get("/login", (req, res) => {
  const templateVars = {
    user: undefined
  };
  res.render("urls_login", templateVars);

});

app.post("/login", (req, res) => {
  const userEnteredEmail = req.body.email;
  const userEnteredPassword = req.body.password;
  const user_id = emailCheck(users, userEnteredEmail)
  const hashedPassword = users[user_id].password

  if(user_id) {
    if (users[user_id].email === userEnteredEmail && bcrypt.compareSync(userEnteredPassword, hashedPassword)) {
      console.log("Logged in user:", user_id);
      return res.cookie("user_id", user_id).redirect("/urls");
    } else {
      return res.status(403).send("The email and password entered do not match. Please try again.");
    }
  }

  return res.status(403).send("Email cannot be found. Please enter a valid email address.")

});

// logout
app.post("/logout", (req, res) => {
  const user_id = req.cookies["user_id"];
  console.log('logged out user:', user_id);
  res.clearCookie("user_id", res.cookie.user).redirect("/urls");
});

// create new shortURL
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];

  if (!user_id) {
    return res.redirect("/access_denied");
  } 
  const templateVars = {
    urls: userURLS(urlDatabase, user_id),
    user: user_id
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    const newShortURL = generateRandomString();
    const user_id = req.cookies["user_id"];

    urlDatabase[newShortURL] = { longURL: 'http://' + req.body.longURL, userID: user_id }
    console.log(`New short url created: ${newShortURL} for ${req.body.longURL}`);
    console.log("Ur")
    res.redirect(`/urls/${newShortURL}`);

  } else {
    res.status(403).redirect("/login");
  }
});


// update existing shortURL
app.post("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];

  urlDatabase[req.params.shortURL] = { longURL: 'http://' + req.body.longURL, userID: user_id }

  console.log('Database updated: ', urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

// redirecting shortLink
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Link does not exist!");
  } 
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(`Redirecting to: ${longURL}`);
  res.redirect(longURL);

});

// delete existing shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.cookies["user_id"];

  if (user_id === undefined || urlDatabase[req.params.shortURL].userID !== user_id) {
    return res.status(403).send("Oops! You do not have permission to delete this link!");
  }

  delete urlDatabase[req.params.shortURL];
  console.log('shortURL deleted by: ', users[user_id].id, '\nNew database: ', urlDatabase);
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
    if (users[user].email === email) return user;
  }
}

function userURLS(database, id) {
  let newDB = {};

  for (let url in database) {
    if (database[url].userID === id) newDB[url] = database[url].longURL
  }
  return newDB;
}