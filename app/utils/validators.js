const { Account } = require("../schema/models");
const validator = require("email-validator");
const { getFormattedDate } = require("./utils");

const accountExists = async (res, email) => {
	const existingAccount = await Account.findOne({ email });
	if (existingAccount) {
		res.json({
			success: false,
			body: { errorType: "AccountError", error: "Email already exists" },
		});
		return false;
	}
	return true;
};

const domains = ["com", "in", "org", "ru", "fr", "eu", "br", "net", "uk"];
const providers = ["gmail", "yahoo", "hotmail", "ymail", "reddifmail"];
const validateEmail = (res, email) => {
	if (!validator.validate(email) || email.split("@")[0].length === 0) {
		res.json({
			success: false,
			body: { errorType: "AccountError", error: "Invalid email address" },
		});
		return false;
	}
	const emailServer = email.split("@")[1];
	const provider = emailServer.split(".")[0];
	const domain = emailServer.split(".")[1];
	if (!providers.includes(provider) || !domains.includes(domain)) {
		res.json({
			success: false,
			body: { errorType: "AccountError", error: "Invalid email address" },
		});
		return false;
	}
	return true;
};

const validatePassword = (res, password) => {
	if (password.length < 6) {
		res.json({
			success: false,
			body: {
				errorType: "AccountError",
				error: "Password should contain atleast 6 characters",
			},
		});
		return false;
	}
	return true;
};

const validateContactNumber = (res, contactNumber) => {
	if (isNaN(String(contactNumber)) || String(contactNumber).length !== 10) {
		res.json({
			success: false,
			body: {
				errorType: "AccountError",
				error: "Invalid contact number",
			},
		});
		return false;
	}
	return true;
};

const validateAccountDetails = (res, data) => {
	const { email, password, contactNumber } = data;

	if (!email || !password || !contactNumber) {
		res.json({
			success: false,
			body: {
				errorType: "AccountError",
				error: "Incomplete information provided",
			},
		});
		return false;
	}
	return true;
};

const genders = ["Male", "Female"];
const validateStudentDetails = (res, details) => {
	const {
		firstName,
		lastName,
		dateOfBirth,
		gender,
		college,
		course,
		yearOfStudying,
		projects,
		skills,
	} = details;

	if (
		!firstName ||
		!lastName ||
		!dateOfBirth ||
		!gender ||
		!college ||
		!course ||
		!yearOfStudying
	) {
		res.json({
			success: false,
			body: {
				errorType: "InformationError",
				error: "Incomplete information provided",
			},
		});
		return false;
	}
	if (!genders.includes(gender)) {
		res.json({
			success: false,
			body: { errorType: "InformationError", error: "Invalid gender" },
		});
		return false;
	}
	if (!getFormattedDate(dateOfBirth)) {
		res.json({
			success: false,
			body: {
				errorType: "InformationError",
				error: "Invalid date of birth",
			},
		});
		return false;
	}
	projects.forEach((project) => {
		if (!project.title || !project.link) {
			res.json({
				success: false,
				body: {
					errorType: "InformationError",
					error: "Invalid project list",
				},
			});
			return false;
		}
	});
	skills.forEach((skill) => {
		if (!skill.title) {
			res.json({
				success: false,
				body: {
					errorType: "InformationError",
					error: "Invalid skill list",
				},
			});
			return false;
		}
	});
	return true;
};

const validateCollegeDetails = (res, details) => {
	const { name, address, university } = details;

	if (!name || !address || !university) {
		res.json({
			success: false,
			body: {
				errorType: "InformationError",
				error: "Incomplete information provided",
			},
		});
		return false;
	}
	return true;
};

const validateCompanyDetails = (res, details) => {
	const { name, address } = details;

	if (!name || !address) {
		res.json({
			success: false,
			body: {
				errorType: "InformationError",
				error: "Incomplete information provided",
			},
		});
		return false;
	}
	return true;
};

const validateInternshipInput = (res, input) => {
	let error = '';
	if (
		!input.title ||
		!input.description ||
		!input.stipend ||
		!input.duration ||
		!input.numberOfPositions ||
		!input.category ||
		!input.applicationEnd
	) 
		error = 'Incomplete information provided'
	else if(isNaN(input.stipend) || input.stipend < 0) 
		error = 'Invalid stipend'
	else if(isNaN(input.duration) || input.duration <= 0) 
		error = 'Invalid duration'
	else if(isNaN(input.numberOfPositions) || parseInt(input.numberOfPositions) <= 0) 
		error = 'Invalid number of positions'
	else if(!getFormattedDate(input.applicationEnd) && getFormattedDate(input.applicationEnd) > getFormattedDate(new Date())) 
		error = 'Invalid application end date'
	if(error) {
		res.json({success: false, body: {error}})
		return false;
	}
	return true;
};

module.exports = {
	accountExists,
	validateCompanyDetails,
	validatePassword,
	validateCollegeDetails,
	validateAccountDetails,
	validateContactNumber,
	validateStudentDetails,
	validateEmail,
	validateInternshipInput,
};
