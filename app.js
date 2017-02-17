var express = require("express"),
	//https = require("https"),
	fs = require('fs'),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	log_middleware = require("./middlewares/log"),
	find_user_middleware = require("./middlewares/find_user"),
	find_note_middleware = require("./middlewares/find_note");

//var service = require('./services');
var ObjectId = require('mongoose').Types.ObjectId; 


/*from Openshift*/
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();
var initDb = function(callback) {
  if (mongoURL == null) return;
  var mongodb = require('mongodb');
  if (mongodb == null) return;
  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }
    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';
    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};
/*from Openshift ends*/


//mongoose.connect("mongodb://localhost/schedule_service");

var User = require("./models/User").User,
	Note =  require("./models/Note").Note;

var app = express();

//var secure_port = process.env.SECURE_PORT || 443;
//var http_port = process.env.NORMAL_PORT || 8080;
//var interface = process.env.SERVER_IFACE || null;


/* SSL * /
https.createServer({
	key: fs.readFileSync('./SSL/key.key'),
	cert: fs.readFileSync('./SSL/certificate.cer')
}, app).listen( secure_port, interface );
/* */

app.use( bodyParser.json() );   // Para peticiones application/json
app.use( bodyParser.urlencoded( {extended: true} ) );  // el true es necesario, para parsear muchas muchas cosas

api_router = express.Router();

api_router.route

api_router.all("/users/:id*", find_user_middleware);
api_router.all("/notes/:usr_id/:id*", find_note_middleware);

api_router.route("/auth").post(function(req, res){
	User.findOne({ email: req.body.email }, function(err, user){
		if(err)
			res.json({err:err});
		else if( user == null )
			res.json({
					"res" : "Usuario no encontrado."
				});
		else
			res.json({
					"res" : "Ok",
					"obj" : user
				});
	});
});

api_router.route("/users")
	.get(function(req,res){	
		User.find({}, function(err, users){
			if(err)
				res.json({err:err});
			else 
				res.json(users);
		});
	})
	.post(function(req,res){
		var data = {
			name : req.body.name,
			lastname : req.body.lastname,
			/*password : req.body.password,
			password_confirmation : req.body.password_confirmation,
			birthday : req.body.birthday,
			*/
			photo_uri : req.body.photo_uri,
			email : req.body.email,
			premium : false
		};
		var user = User(data);
		user.save(function(err){
			if(err)
				res.json({err:err});
			else if( user == null )
				res.json({
						"res" : "Usuario no encontrado."
					});
			else
				res.json({
					"res" : "Ok",
					"obj" : user
				});
		});
	});

api_router.route("/users/:id")
	.get(function(req,res){
		res.json(res.locals.user);
	}).put(function(req,res){
		res.locals.user.name = 					(req.body.name != undefined)? req.body.name : res.locals.user.name;
		res.locals.user.lastname = 				(req.body.lastname != undefined)? req.body.lastname : res.locals.user.lastname;
		/*res.locals.user.password = 				(req.body.password != undefined)? req.body.password : res.locals.user.password;
		res.locals.user.password_confirmation = (req.body.password_confirmation != undefined)? req.body.password_confirmation : res.locals.user.password_confirmation;
		res.locals.user.birthday = 				(req.body.birthday != undefined)? req.body.birthday : res.locals.user.birthday;*/
		res.locals.user.email = 				(req.body.email != undefined)? req.body.email : res.locals.user.email;
		res.locals.user.premium = 				(req.body.premium != undefined)? req.body.premium : res.locals.user.premium;
		res.locals.user.save(function(err){
			if(err)
				res.json({err:err});
			else if( user == null )
				res.json({
						"res" : "Usuario no encontrado."
					});
			else
				res.json({
					"res" : "Ok",
					"obj" : res.locals.user
				});
		});
	}).delete(function(req,res){
		res.locals.user.remove({}, function(err){
			if(err)
				res.json({err:err});
			else
				res.json({
					"res" : "Ok"
				});
		});
	});

api_router.route("/notes/:usr_id")
	.get(function(req,res){	
		var query = { owner: new ObjectId( req.params.usr_id ) };
		if( req.query.find != undefined )
			query.state = req.query.find ;

		Note.find( query , function(err, notes){
			if(err)
				res.json({err:err});
			else 
				res.json(notes);
		});
	})
	.post(function(req,res){
		var data = {
			title : req.body.title,
			body : req.body.body,
			color : req.body.color,
			state : 'normal',
			creation : new Date(),
			reminder : req.body.reminder,
			lastedit : new Date(),
			owner : new ObjectId(req.params.usr_id)
		};
		var note = Note(data);
		note.save(function(err){
			if(err)
				res.json({err:err});
			else if( note == null )
				res.json({
						"res" : "Nota no encontrada."
					});
			else
				res.json({
					"res" : "Ok",
					"obj" : note
				});
		});
	});

api_router.route("/notes/:usr_id/:id")
	.get(function(req,res){
		res.json(res.locals.note);
	}).put(function(req,res){
		res.locals.note.title = 					(req.body.title != undefined)? req.body.title	 	: res.locals.note.title;
		res.locals.note.body = 						(req.body.body != undefined)? req.body.body 		: res.locals.note.body;
		res.locals.note.color = 					(req.body.color != undefined)? req.body.color	 	: res.locals.note.color;
		res.locals.note.state = 					(req.body.state != undefined)? req.body.state 		: res.locals.note.state;
		res.locals.note.reminder = 					(req.body.reminder != undefined)? req.body.reminder	: res.locals.note.reminder;
		res.locals.note.lastedit = new Date();
		res.locals.note.save(function(err){
			if(err)
				res.json({err:err});
			else
				res.json({
					"res" : "Ok",
					"obj" : res.locals.note
				});
		});
	}).delete(function(req,res){
		res.locals.note.remove({}, function(err){
			if(err)
				res.json({err:err});
			else
				res.json({
					"res" : "Ok"
				});
		});
	});


app.get("/", function(req, res){
	console.log("Serving a root, GET request...");
	res.send("Hi people, You Are Now At My Domains <br>By Chemo....");
});

app.use("/", log_middleware);
app.use("/api", api_router);

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(http_port, interface, function(){
	console.log("running...");
});

console.log("done...");
//End

module.exports = app ;