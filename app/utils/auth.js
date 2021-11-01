const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

/* password */

const hashPassword = async (password) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	return hashedPassword;
};

const comparePassword = async (password, hashedPassword) => {
	const isValid = await bcrypt.compare(password, hashedPassword);
	return isValid;
};

/* access token */

const getAccountId = async (accessToken) => {
	try {
		const account = jwt.verify(accessToken, ACCESS_TOKEN_SECRET)
		return account._id;
	}
	catch {
		return false;
	}
}

const generateAccessToken = (account) => {
	return jwt.sign(
		{
			_id: account._id,
			email: account.email,
			password: account.password,
			accountType: account.accountType,
		},
		ACCESS_TOKEN_SECRET
	);
};

const verifyAccessToken = async (req, res, next) => {
	const { _id } = req.params;
	const { accessToken } = req.cookies;
	if (!accessToken)
		return res
			.status(401)
			.json({ success: false, body: { error: "No access token" } });
	jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (err, account) => {
		if (err || (_id && _id !== account._id))
			return res
				.status(401)
				.json({
					success: false,
					body: { error: "Invalid access token" },
				});
		req.account = account;
		next();
	});
};

module.exports = {
	hashPassword,
	comparePassword,
	generateAccessToken,
	verifyAccessToken,
	getAccountId,
};
