var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var state_validation = ["normal","recycle_bin","archivated"];

var note_schema = new Schema( {
        title : {type: String },
        body : {type: String, required: "Nota no puede estar vacia"},
        color : {type: String, required: true},
        state : {type: String, required: true, enum : {values: state_validation, message: "Opción no válida"} },
        creation : {type: Date, required: true},
        reminder : {type: Date, required: true},
        lastedit : {type: Date, required: true},
        owner : {type : Schema.Types.ObjectId, required: true, ref: "User"}
}, {
        toObject: {
                virtuals: true
        },
        toJSON: {
                virtuals: true
        }
});


var Note = mongoose.model("Note", note_schema);

module.exports.Note = Note;

