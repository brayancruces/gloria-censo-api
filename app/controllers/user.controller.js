const User = require("../models/user.model.js");
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');


const envConfig = require("../config/env.config.js");

// Login 

const schemaLogin = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  dni: Joi.string().min(8).max(9).required()
})


const schemaUpdate = Joi.object({
  full_name: Joi.string().min(3).max(255)
})


exports.login = async (req, res) => {

  // Validaciones
  const { error } = schemaLogin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message })
  


  const user = User.findByEmail(req.body.email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Usuario no encontrado`
        });
      } else {
        res.status(500).send({
          message: "Ocurrió un error al iniciar sesión"
        });
      }
    } else {

      var requestedDNI = req.body.dni; 
      var trueDNI = data.dni;

      if (requestedDNI.trim() != trueDNI.trim()) return res.status(400).json({ error: 'Acceso no valido' })


      // JWT
      const token = jwt.sign({
            name: data.full_name,
            email: data.email,
            dni: data.dni
      }, envConfig.TOKEN_SECRET)
        
      res.header('auth-token', token).json({
          error: null,
          data: {token}
      })
    
      


    } 
  });

  
};



// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
    User.getAll((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving customers."
          });
        else res.send(data);
      });
  
};

// Find a single Customer with a dni
exports.findOne = (req, res, next) => {

    // Buscar por DNI 
    User.findByDni(res.locals.user.dni, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Customer with id ${req.params.customerId}.`
            });
          } else {
            res.status(500).send({
              message: "Error retrieving Customer with id " + req.params.customerId
            });
          }
        } else res.send(data);
      });
  
};


// Guardar un Censado
exports.saveOne = (req, res) => {

  // Validaciones 
  //const { error } = schemaUpdate.validate(req.body);
  //if (error) return res.status(400).json({ error: error.details[0].message })

  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "El contenido no puede estar vacio"
    });
  }
  
  console.log('Información actualizada:' + req.params.dni); 
  console.log(req.body);

  User.updateByDni(res.locals.user.dni, req.body, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `No se encontro al usuario.`
          });
        } else {
          res.status(500).send({
            message: "Ocurrio un error al devolver usuario"
          });
        }
      } else res.send(data);
    });
  
};
