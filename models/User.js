var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var email_validation = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Coloca un email válido"];

var user_schema = new Schema({
	name : {type: String, required: "El nombre de usuario es obligatorio.", maxlength: [70, "Nombre demasiado largo."] },
	lastname : {type: String, required: "Al menos un apellido es obligatorio.", maxlength: [110, "Apellido demasiado largo."] },
	/*password : {
		type: String, 
		required: "La contraseña es obligatoria.", 
		minlength: [8, "Contraseña demasiada corta."], 
		validate : {
			validator : function(pass){ return this.pass_confirm == pass; }, 
			message : "Las contraseñas no son iguales."
		} 
	},
	birthday : {type: Date, required: "La fecha de nacimiento es obligatoria."},*/
	photo_uri : {type: String},
	email : {type: String, required: "El correo es obligatorio.", maxlength: [80, "Email demasiado largo"], match: email_validation },
	premium : {type: Boolean, required: true}
}, {
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true 
	}
});
/*user_schema.virtual("password_confirmation").get(function(){
	return this.pass_confirm;
}).set(function(password){
	this.pass_confirm = password;
});
user_schema.virtual("age").get(function(){
	var current = new Date();
	var diff = new Date( current.getTime() - this.birthday.getTime()  );
	return diff.getFullYear() - 1970;
});
*/user_schema.virtual("fullname").get(function(){
	if (this.lastname != undefined)
		return this.name + " " + this.lastname;
	else
		return this.name;
});

var User = mongoose.model("User", user_schema);

module.exports.User = User;

