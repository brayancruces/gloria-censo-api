const User = require("../models/user.model.js");
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const envConfig = require("../config/env.config.js");

// Login 

const schemaLogin = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  dni: Joi.string().min(8).max(9).required(),
  pass: Joi.string()
})


const schemaCreatePassword = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  dni: Joi.string().min(8).max(9).required(),
  code: Joi.string().required(),
  pass: Joi.string(),
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
      

      // Verificar si tiene Password asignada
      if(data.has_password && !req.body.pass) {

         return res.status(400).json({ error: 'Ingresar Password faltante', code: 'hasPassword' })
      } 

      // No tiene Password
      if(!data.has_password) { 

        // Generar Password en db  
        var generateCodeUser = data.dni;  

        User.updateByDni(data.dni, {"temp_code": generateCodeUser}, (err, data) => {
          if (err) {
            if (err.kind === "not_found") {
              console.log("No se encontro al usuario.");
            } else {
              console.log("Ocurrió un error al devolver el usuario");
            }
          } else console.log("Actualización correcta de temp Code");
        });



        // Enviar Correo

        let jConfig = {
              "host":"smtp.sendgrid.net", 
              "port": 587, 
              "secure":false, 
              "auth":{ 
                    "user":"apikey", 
                    "pass":"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" 
          }
        };

        let email ={ 
          from:"info@escuadrontec.com",  //remitente
          to: data.email,  //destinatario
          subject:"Se envió código de ACCESO - CENSO GLORIA",  //asunto del correo
          html: 'Este es tu código de acceso, podras ingresar y asignarte una password: <br> <b>'+ generateCodeUser + '</b>'

      };

      let createTransport = nodemailer.createTransport(jConfig);


      createTransport.sendMail(email, function (error, info) { 
        if(error){ 
             console.log("Error al enviar email a "+ data.email); 
             console.log(error);
        } else{ 
             console.log("Correo enviado correctamente a " + data.email); 
        } 
        createTransport.close(); 
      });


        // Respuesta 

        return res.status(400).json({ error: 'No tiene generada un password, se envió codigo a correo.', code: 'noPassword' })


      }


      // Verificar si toda la información (dni, correo y pass)  + password coincide 


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


// Create Password 


exports.createPassword = async (req, res) => {

  // Validaciones
  const { error } = schemaCreatePassword.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message })

  // Checar validez de código  (email, dni, code y pass) 

  var codigoAcceso = req.body.code.trim();

  User.findByCodeAndEmail(req.body.dni, codigoAcceso, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No coincide código de acceso`
        });
      } else {
        res.status(500).send({
          message: "Hubo un problema al verificar código de acceso"
        });
      }
    }
    else {

      // Actualizar Password 

      User.updateByDni(data.dni, {"password": req.body.pass, "has_password": 1}, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            console.log("No se encontro al usuario.");
          } else {
            console.log("Ocurrió un error al devolver el usuario");
          }
        } else console.log("Actualización correcta de password");

        return res.status(200).json({ message: 'Se actualizo correctamente', code: 'passwordUpdate' })
      });

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
