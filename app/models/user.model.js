const sql = require("./db.js");




// constructor
const User = function(user) {
  this.email = user.email;
  this.name = user.full_name;
};

const tableName = 'censados'; 

User.findByEmail = (email, result) => {
  sql.query(`SELECT * FROM ${tableName} WHERE email = "${email}"`, (err, res) => {
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


User.findByDni = (dni, result) => {
    sql.query(`SELECT * FROM ${tableName} WHERE dni = ${dni}`, (err, res) => {
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
    sql.query("SELECT * FROM ${tableName}", (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      console.log("users: ", res);
      result(null, res);
    });
  };
  
  User.updateByDni =  (dni, user, result) => { 
   
   
    const query = "UPDATE censados SET " + Object.keys(user).map(key => `${key} = ?`).join(", ") + " WHERE dni ="+ dni;
    const parameters = [...Object.values(user), dni];
    console.log("updateCensado: Running query:", query);
    sql.query(query, parameters,(err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated censado: ", { dni: dni});
      result(null, { dni: dni, ...user });
    });

    
    /*sql.query(
      "UPDATE censados SET lugar_nac = ?, full_name = ?, estado_civil = ? WHERE dni = ?",
      [user.lugar_nac, user.full_name, user.active, dni],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }
  
        if (res.affectedRows == 0) {
          // not found Customer with the id
          result({ kind: "not_found" }, null);
          return;
        }
  
        console.log("updated customer: ", { dni: dni});
        result(null, { dni: dni, ...user });
      }
    ); */
  };

  module.exports = User;
