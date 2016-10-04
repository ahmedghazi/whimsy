// Example model

var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

var CommentsSchema = new Schema({
	comment_status: {
        type: String, default: "brouillon"
    },
	//title: String,
	texte: String,
	parent: {type: Schema.Types.ObjectId, ref: 'Posts'},
	author: {type: Schema.Types.ObjectId, ref: 'Users'},
},{
    timestamps: true
});

mongoose.model('Comments', CommentsSchema);