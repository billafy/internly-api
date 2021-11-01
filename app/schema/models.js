const {Schema, model} = require('mongoose')

const accountSchema = new Schema({
	email: String,
	password: String,
	accountType: String,
	contactNumber: Number,
	description: String,
	followers: [String],
	following: [String],
	creationDate: String,
	profilePicture: String,
	details: Object,
})

/* const studentSchema = new Schema({
	firstName: String,
	lastName: String,
	dateOfBirth: String,
	gender: String,
	college: String,
	course: String,
	yearOfStudying: Number,
	reputationPoints: Number,
	accountId: String,
	resume: String,
})

const collegeSchema = new Schema({
	name: String,
	address: String,
	university: String,
	accountId: String
})

const companySchema = new Schema({
	name: String,
	address: String,
	accountId: String,
}) */

const internshipSchema = new Schema({
	title: String,
	description: String,
	stipend: Number,
	duration: Number,
	applicationStart: String,
	applicationEnd: String,
	category: String,
	numberOfPositions: Number,
	companyId: {type: Schema.Types.ObjectId, ref: 'Account'},
	applications: [{
		_id: String,
		message: String,
		dateTime: String,
		status: String,
		studentId: {type: Schema.Types.ObjectId, ref: 'Account'},
	}]
})

const eventSchema = new Schema({
	title: String,
	type: String,
	dateTime: String,
	description: String,
	status: String,
	fee: Number,
	prize: String,
	collegeId: {type: Schema.Types.ObjectId, ref: 'Account'},
	participants: [{
		_id: String,
		studentId: {type: Schema.Types.ObjectId, ref: 'Account'},
	}]
})

const postSchema = new Schema({
	content: String,
	media: String,
	likes: [{type: Schema.Types.ObjectId, ref: 'Account'}],
	accountId: String,
	postedBy: {type: Schema.Types.ObjectId, ref: 'Account'},
	creationDate: String,
	comments: [{
		_id: String,
		text: String,
		commentedBy: {type: Schema.Types.ObjectId, ref: 'Account'},
		likes: Number,
	}]
})

const messageSchema = new Schema({
	text: String,
	dateTime: String,
	from: {type: Schema.Types.ObjectId, ref: 'Account'},
	to: {type: Schema.Types.ObjectId, ref: 'Account'}
})

module.exports = {
	Account: model('Account', accountSchema),
	Internship: model('Internship', internshipSchema),
	Event: model('Event', eventSchema),
	Post: model('Post', postSchema),
	Message: model('Message', messageSchema),
}

/*
61011d8e34d83312500955b7
6167149f5a7470185887be24
616d21425e99a0425067b3ca
*/