module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const verifyToken = require('../helpers/validate-token');

  
    
    /***    
     * 
     * Autenticación
     * 
     * */

    // Loguear
    app.post("/login", users.login);


    /***    
     * 
     * Usuarios
     * 
     * */

    // Obtener información de Censado
    app.get("/users", verifyToken, users.findOne);

    // Actualizar información de Censado
    app.post("/users", verifyToken, users.saveOne); 




    /***    
     * 
     * Listados (no autenticados)
     * 
     * */

    // Listado de Enfermedades (nuevo)

    //app.get("/data/enfermedades", verifyToken, list.getEnfermedades);


    // Listado de detalle de Enfermedades (nuevo)

    //app.get("/data/enfermedades/detalle", verifyToken, list.getDetalleEnfermedades);


  
};