module.exports = function(req,res,next){
	console.log( "serving a " + req.method + " request at " + req.url );
	next();
}
