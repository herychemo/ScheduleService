var jwt = require('jwt-simple');  
var moment = require('moment');  
var config = require('../config');
module.exports = function(req,res,next){
	if(!req.headers.authorization) {
		return res
			.status(403)
			.send({res: "Acceso No Autorizado"});
		var token = req.headers.authorization.split(" ")[1];
		var payload = jwt.decode(token, config.TOKEN_SECRET);

		if (payload.exp <= moment().unix() ) {
			return res
				.status(401)
				.send({res: "El Token Ha Expirado"});
		}
		req.user = payload.sub;
		next();
	}
}