const { Internship } = require("../schema/models");
const { validateInternshipInput } = require("../utils/validators");
const { getFormattedDate, currentDateTimestamp } = require("../utils/utils");
const { v4 } = require("uuid");

const getInternship = async (req, res) => {
	const { internshipId } = req.params;
	try {
		const internship = await Internship.findById(internshipId).populate(
			"companyId"
		);
		if (!internship) throw "Internship does not exist.";
		res.json({ success: true, body: { internship } });
	} catch (error) {
		res.json({ success: false, body: { error: error.message || error } });
	}
};

const getInternships = async (req, res) => {
	let internships;
	if (req.query === {})
		internships = await Internship.find().populate("companyId");
	else {
		const query = {};
		const { category, stipend, duration, keyword } = req.query;
		if (category && category !== "All") query.category = category;
		if (stipend) query.stipend = { $gte: Number(stipend) };
		if (duration) query.duration = { $gte: Number(duration) };
		if (keyword) query.title = { $regex: `${keyword}.*`, $options: "i" };
		internships = await Internship.find({ ...query }).populate("companyId");
	}
	res.json({ success: true, body: { internships } });
};

const myAppliedInternships = async (req, res) => {
	const {_id} = req.params;
	const internships = await Internship.find({}).populate("companyId");
	let newInternships = await internships.map(internship => {
		const application = internship.applications.find(application => application.studentId.toString() === _id)
		if(!application) 
			return null;
		const newInternship = internship._doc;
		delete newInternship.applications;
		return {...newInternship, application};
	})
	newInternships = newInternships.filter(internship => internship);
	res.json({success: true, body: {internships: newInternships}});
}

const getCompanyInternships = async (req, res) => {
	const companyId = req.account._id;
	try {
		const internships = await Internship.find({ companyId }).populate({
			path: "applications",
			populate: {
				path: "studentId",
			},
		});
		res.json({ success: true, body: { internships } });
	} catch (error) {
		res.json({ success: false, body: { error: error.message || error } });
	}
};

const createInternship = async (req, res) => {
	const input = req.body.internshipInput;
	if (req.account.accountType !== "company")
		return res.json({
			success: false,
			body: { error: "Unauthorized account type." },
		});

	if (!validateInternshipInput(res, input)) return;

	const internship = new Internship({
		title: input.title,
		description: input.description,
		stipend: input.stipend,
		duration: input.duration,
		applicationStart: getFormattedDate(new Date()),
		applicationEnd: getFormattedDate(input.applicationEnd),
		category: input.category,
		numberOfPositions: input.numberOfPositions,
		applications: [],
		companyId: req.account._id,
	});
	await internship.save();
	res.json({ success: true, body: { internship } });
};

const applyInternship = async (req, res) => {
	const { internshipId, _id } = req.params;
	const { message } = req.body;
	const { accountType } = req.account;
	try {
		if (accountType !== "student") throw "Invalid account type.";
		let internship = await Internship.findById(internshipId);
		if (!internship) throw "Internship does not exist.";
		const applied = internship.applications.find(
			(application) => application.studentId.toString() === _id
		);
		if (applied) throw "Already applied.";
		internship.applications.push({
			_id: v4(),
			message: message || "",
			dateTime: new Date().toString(),
			status: "Applied",
			studentId: _id,
		});
		await internship.save();
		internship = await Internship.findById(internshipId).populate(
			"companyId"
		);
		res.json({ success: true, body: { internship } });
	} catch (error) {
		return res.json({
			success: false,
			body: { error: error.message || error },
		});
	}
};

const updateApplicationStatus = async (req, res) => {
	const { _id, internshipId, applicationId } = req.params;
	const { status } = req.body;
	try {
		if (status !== "Rejected" && status !== "In Touch")
			throw "Invalid application status";
		let internship = await Internship.findById(internshipId)
		if (!internship) throw "Internship does not exist.";
		if (_id !== internship.companyId.toString())
			throw "Not allowed to update.";
		const newApplications = internship.applications.map(application => {
			if(String(application._id) == applicationId) {
				let newApplication = application;
				newApplication.status = status;
				return newApplication;
			}
			return application;
		})
		internship = await Internship.findByIdAndUpdate(internshipId, {applications: newApplications}, {new: true}).populate("companyId")
			.populate({
				path: "applications",
				populate: {
					path: "studentId",
				},
			});
		res.json({ success: true, body: { internship } });
	} catch (error) {
		res.json({ success: false, body: { error: error.message || error } });
	}
};

module.exports = {
	getInternship,
	getInternships,
	getCompanyInternships,
	createInternship,
	applyInternship,
	updateApplicationStatus,
	myAppliedInternships,
};
