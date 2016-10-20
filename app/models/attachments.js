// Example model

var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

var AttachmentsSchema = new Schema({
	date_created: {
        index: true,
        type: Date, default: Date.now
    },
    originalname: String,
    mimetype: String,
	filename: String,
	path: String,
	size: Number,
    texte: String,
    uploaded_by: {type: Schema.Types.ObjectId, ref: 'Users'},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comments'}],
},{
    timestamps: true
});



mongoose.model('Attachments', AttachmentsSchema);

