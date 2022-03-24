const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    
    assert.equal(user, expectedUserID);
  },
  it('should return undefined if an email passed is NOT within the database', () => {
    const user = findUserByEmail(testUsers, "a@test.com");
    const expectedUserID = undefined;

    assert.equal(user, undefined);
  }));
});