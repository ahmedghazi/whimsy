// Example model

var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

var PlanningSchema = new Schema({
	post_type: String,
	post_status: {
        type: String, default: "brouillon"
    },
	category: String,
	title: String,
	description: String,
	from: Date,
	to: Date,
	parcours: String,
	destination: String,
	jours: Number,
	distance: String,
	equipage: String,
	image: {type: Schema.Types.ObjectId, ref: 'Attachments'},
    users_in: [{type: Schema.Types.ObjectId, ref: 'Users'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comments'}],
	slug: String,
	link: String,
	post_order: Number,
},{
    timestamps: true
});

mongoose.model('Planning', PlanningSchema);