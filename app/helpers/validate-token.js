const jwt = require('jsonwebtoken')

const envConfig = require("../config/env.config.js");

// middleware to validate token (rutas protegidas)
const verifyToken = (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) return res.status(401).json({ error: 'Acceso denegado, no se está incluyendo el token de acceso.' })
    try {
        const verified = jwt.verify(token, envConfig.TOKEN_SECRET)
        req.user = verified 

        res.locals.user = req.user; 
        
        console.log(req.user)
        next() // continuamos
    } catch (error) {
        res.status(400).json({error: 'Token no es válido'})
    }
}

module.exports = verifyToken;