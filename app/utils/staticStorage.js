/* const multer = require("multer");

const { unlink } = require("fs");

const profilePictureStorage = multer.diskStorage({
	destination: "public/profilePictures/",
	filename: (req, file, cb) => {
		const type = file.mimetype.split("/");
		if (type[0] === "image") cb(null, `${Date.now()}.${type[1]}`);
	},
});
const profilePictureUpload = multer({ storage: profilePictureStorage });

const resumeStorage = multer.diskStorage({
	destination: "public/resumes/",
	filename: (req, file, cb) => {
		const type = file.mimetype.split("/");
		if (type[1] === "pdf") cb(null, `${Date.now()}.${type[1]}`);
	},
});
const resumeUpload = multer({ storage: resumeStorage });

const postStorage = multer.diskStorage({
	destination: "public/posts/",
	filename: (req, file, cb) => {
		const type = file.mimetype.split("/");
		if (type[0] === "image") cb(null, `${Date.now()}.${type[1]}`);
	},
});
const postUpload = multer({ storage: postStorage });

const deleteProfilePicture = async (profilePicture) => {
	unlink(`./public/profilePictures/${profilePicture}`, (err) => {
		if (err) return;
	});
};

const deleteResume = async (resume) => {
	unlink(`./public/resumes/${resume}`, (err) => {
		if (err) return;
	});
};

module.exports = {
	profilePictureUpload,
	resumeUpload,
	postUpload,
	deleteProfilePicture,
	deleteResume,
}; */
