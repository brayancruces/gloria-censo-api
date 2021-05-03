module.exports = app => {
    const users = require("../controllers/user.controller.js");
  
    
    // Retrieve all Users
    app.get("/users", users.findAll);
  
    // Retrieve a single Users
    app.get("/users/:dni", users.findOne);
  
};