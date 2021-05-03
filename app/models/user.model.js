const sql = require("./db.js");

// constructor
const User = function(user) {
  this.email = user.email;
  this.name = user.full_name;
};



User.findByDni = (dni, result) => {
    sql.query(`SELECT * FROM export_gloria_db WHERE dni = ${dni}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      if (res.length) {
        console.log("found user: ", res[0]);
        result(null, res[0]);
        return;
      }
  
      // not found Customer with the id
      result({ kind: "not_found" }, null);
    });
  };
  
User.getAll = result => {
    sql.query("SELECT * FROM export_gloria_db", (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      console.log("users: ", res);
      result(null, res);
    });
  };
  
  module.exports = User;
