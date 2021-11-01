const { Account } = require("../schema/models");
const {
	hashPassword,
	comparePassword,
	generateAccessToken,
} = require("../utils/auth");
const {
	currentDateTimestamp,
	getFormattedDate,
	idify,
} = require("../utils/utils");
const {
	accountExists,
	validateCompanyDetails,
	validatePassword,
	validateCollegeDetails,
	validateAccountDetails,
	validateContactNumber,
	validateStudentDetails,
	validateEmail,
} = require("../utils/validators");
const {
	deleteProfilePicture,
	deleteResume,
} = require("../utils/staticStorage");

/* general methods */

const createAccount = async (res, data) => {
	const hashedPassword = await hashPassword(data.password);

	let account = new Account({
		email: data.email,
		password: hashedPassword,
		accountType: data.accountType,
		contactNumber: data.contactNumber,
		description: data.description || "",
		followers: [],
		following: [],
		creationDate: currentDateTimestamp(),
		profilePicture: "default.png",
		details: data.details,
	});
	account = await account.save();

	return account;
};

/* api views */

const createStudentAccount = async (req, res) => {
	const {
		email,
		password,
		description,
		contactNumber,
		firstName,
		lastName,
		dateOfBirth,
		gender,
		college,
		course,
		yearOfStudying,
	} = req.body;
	const details = {
		firstName,
		lastName,
		dateOfBirth,
		gender,
		college,
		course,
		yearOfStudying,
		reputationPoints: 0,
		projects: [],
		skills: [],
		resume: "",
	};
	if (
		!validateAccountDetails(res, req.body) ||
		!validateStudentDetails(res, details) ||
		!(await accountExists(res, email)) ||
		!validateEmail(res, email) ||
		!validatePassword(res, password) ||
		!validateContactNumber(res, contactNumber)
	)
		return;

	const account = await createAccount(res, {
		email,
		password,
		contactNumber,
		description,
		accountType: "student",
		details: {
			...details,
			dateOfBirth,
			projects: [],
			skills: [],
		},
	});
	if (!account) return;
	const accessToken = generateAccessToken(account);
	res.cookie("accessToken", accessToken, {sameSite: 'None', secure: true});
	res.status(201).json({
		success: true,
		body: { message: "Account created successfully", account },
	});
};

const createCollegeAccount = async (req, res) => {
	const {
		email,
		password,
		description,
		contactNumber,
		name,
		address,
		university,
	} = req.body;
	const details = { name, address, university };
	if (
		!(await accountExists(res, email)) ||
		!validateEmail(res, email) ||
		!validatePassword(res, password) ||
		!validateContactNumber(res, contactNumber) ||
		!validateAccountDetails(res, req.body) ||
		!validateCollegeDetails(res, details)
	)
		return;

	const account = await createAccount(res, {
		email,
		password,
		contactNumber,
		description,
		accountType: "college",
		details,
	});
	if (!account) return;

	const accessToken = generateAccessToken(account);
	res.cookie("accessToken", accessToken, {sameSite: 'None', secure: true});
	res.status(201).json({
		success: true,
		body: { message: "Account created successfully", account },
	});
};

const createCompanyAccount = async (req, res) => {
	const {
		email,
		password,
		description,
		contactNumber,
		name,
		address,
	} = req.body;
	const details = { name, address };
	if (
		!(await accountExists(res, email)) ||
		!validateEmail(res, email) ||
		!validatePassword(res, password) ||
		!validateContactNumber(res, contactNumber) ||
		!validateAccountDetails(res, req.body) ||
		!validateCompanyDetails(res, details)
	)
		return;

	const account = await createAccount(res, {
		email,
		password,
		contactNumber,
		description,
		accountType: "company",
		details,
	});
	if (!account) return;

	const accessToken = generateAccessToken(account);
	res.cookie("accessToken", accessToken, {sameSite: 'None', secure: true});
	res.status(201).json({
		success: true,
		body: { message: "Account created successfully", account },
	});
};

const getAccount = async (req, res) => {
	const {_id} = req.params
	const account = await Account.findById(_id);
	if(!account) 
		return res.json({success: false, body: {error: 'Account does not exists.'}})
	res.json({success: true, body: {account}})
}

const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password)
		return res.status(400).json({
			success: false,
			body: { error: "Credentials not provided" },
		});

	const account = await Account.findOne({ email });
	if (!account)
		return res.status(400).json({
			success: false,
			body: { error: "Account does not exist" },
		});

	if (!(await comparePassword(password, account.password)))
		return res
			.status(403)
			.json({ success: false, body: { error: "Incorrect password" } });

	const accessToken = generateAccessToken(account);
	res.cookie("accessToken", accessToken, {sameSite: 'None', secure: true});

	res.json({
		success: true,
		body: { message: "Logged in successfully", account },
	});
};

const refresh = async (req, res) => {
	const account = await Account.findById(req.account._id);
	res.json({
		success: true,
		body: { message: "Token was verified", account },
	});
};

const logout = async (req, res) => {
	res.clearCookie("accessToken");
	res.json({ success: true, body: { message: "Logged out successfully" } });
};

const updateEmail = async (req, res) => {
	const {
		body: { email },
		params: { _id },
	} = req;
	if (!(await accountExists(res, email)) || !validateEmail(res, email))
		return;
	const account = await Account.findByIdAndUpdate(
		_id,
		{ email },
		{ new: true }
	);
	res.json({ success: true, body: { message: "Email updated", account } });
};

const updatePassword = async (req, res) => {
	const {
		body: { password },
		params: { _id },
	} = req;
	if (!password)
		return res.json({ success: false, body: { error: "No password" } });
	if (!validatePassword(res, password)) return;
	const hashedPassword = await hashPassword(password);
	Account.findByIdAndUpdate(
		_id,
		{ password: hashedPassword },
		{ new: true }
	).exec();
	res.json({ success: true, body: { message: "Password updated" } });
};

const updateAccount = async (req, res) => {
	const { accountType } = req.account;
	const { _id } = req.params;
	if (!req.body.account)
		return res.json({
			success: false,
			body: { error: "Incomplete information provided" },
		});
	let { contactNumber, description, details } = req.body.account;
	if (!contactNumber || !details)
		return res.json({
			success: false,
			body: { error: "Incomplete information provided" },
		});
	if (!validateContactNumber(res, contactNumber)) return;
	if (accountType === "student" && !validateStudentDetails(res, details))
		return;
	else if (accountType === "college" && !validateCollegeDetails(res, details))
		return;
	else if (accountType === "company" && !validateCompanyDetails(res, details))
		return;
	if (accountType === "student")
		details = {
			...details,
			projects: idify(details.projects),
			skills: idify(details.skills),
		};
	const updatedAccount = await Account.findByIdAndUpdate(
		_id,
		{ contactNumber, description, details },
		{ new: true }
	);
	res.json({
		success: true,
		body: { message: "Account updated", account: updatedAccount },
	});
};

const searchAccounts = async (req, res) => {
	const { keyword } = req.params;
	const regexp = { $regex: `${keyword}.*`, $options: "i" };
	const orCondition = {
		$or: [
			{ "details.firstName": regexp },
			{ "details.lastName": regexp },
			{ "details.name": regexp },
		],
	};
	const accounts = await Account.find(orCondition, [
		"details",
		"profilePicture",
	]);
	res.json({
		success: true,
		body: {
			message: `${accounts.length} result(s) found`,
			results: accounts,
		},
	});
};

const getAccountIds = async (req, res) => {
	const _ids = await Account.find({}, ['_id'])
	res.json({success: true, body: {_ids}})
}

const uploadResume = async (req, res) => {
	const {
		params: { _id },
		file: { filename },
	} = req;
	const account = await Account.findById(_id);
	if (account.details.resume) deleteResume(account.details.resume);
	account.details = { ...account.details, resume: filename };
	await account.save();
	res.json({
		success: true,
		body: { message: "Resume uploaded", account },
	});
};

const uploadProfilePicture = async (req, res) => {
	const {
		params: { _id },
		file: { filename },
	} = req;
	const account = await Account.findById(_id);
	if (account.profilePicture !== "default.png" && account.profilePicture)
		deleteProfilePicture(account.profilePicture);
	account.profilePicture = filename;
	await account.save();
	res.json({
		success: true,
		body: { message: "Profile picture uploaded", account },
	});
};

module.exports = {
	createStudentAccount,
	createCollegeAccount,
	createCompanyAccount,
	login,
	refresh,
	logout,
	searchAccounts,
	updateEmail,
	updatePassword,
	updateAccount,
	uploadResume,
	uploadProfilePicture,
	getAccountIds,
	getAccount,
};
