const bcrypt = require("bcryptjs"); 

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

module.exports = { users, urlDatabase };