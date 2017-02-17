var User = require("../models/User").User;
module.exports = function(req,res,next){
	User.findById(req.params.id, '-__v',function(err, user){
		if(err)
			res.json({res:err});
		else if( user != null ){
            res.locals.user = user;	
			next();
        }else
        	res.json({res:"Usuario No Encontrado.."});
	});
}
