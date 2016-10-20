// Example model

var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

var PostsSchema = new Schema({
	post_type: String,
	post_status: {
        type: String, default: "brouillon"
    },
	category: String,
	title: String,
	texte: String,
	from: Date,
	to: Date,
	//enfants: [{type: Schema.Types.ObjectId, ref: 'Attachments'}],
	image: {type: Schema.Types.ObjectId, ref: 'Attachments'},
	images: [{type: Schema.Types.ObjectId, ref: 'Attachments'}],
    users_in: [{type: Schema.Types.ObjectId, ref: 'Users'}],
    
	slug: String,
	link: String,
	post_order: Number,
},{
    timestamps: true
});

mongoose.model('Posts', PostsSchema);