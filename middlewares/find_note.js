var Note = require("../models/Note").Note;
module.exports = function(req,res,next){
	Note.findById(req.params.id, ' -__v').populate("owner").exec(function(err, note){
		if(err)
			res.json({res:err});
		else if( note != null ){
            res.locals.note = note;	
			next();
        }else
        	res.json({res:"Nota No Encontrada.."});
	});
}
