// Example model

var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

var UsersSchema = new Schema({
    email: {
        unique: true,
        index: true,
        type: String
    },
    password: String,
    user_type: String,
    name: String,
    posts_in: [{type: Schema.Types.ObjectId, ref: 'Posts'}],
},{
    timestamps: true
});

UsersSchema.virtual('date')
  	.get(function(){
    	return this._id.getTimestamp();
  	});

mongoose.model('Users', UsersSchema);

