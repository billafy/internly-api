const multer = require("multer");

const { unlink } = require("fs");

const profilePictureStorage = multer.diskStorage({
	destination: "media/profilePictures/",
	filename: (req, file, cb) => {
		const type = file.mimetype.split("/");
		if (type[0] === "image") cb(null, `${Date.now()}.${type[1]}`);
	},
});
const profilePictureUpload = multer({ storage: profilePictureStorage });

const resumeStorage = multer.diskStorage({
	destination: "media/resumes/",
	filename: (req, file, cb) => {
		const type = file.mimetype.split("/");
		if (type[1] === "pdf") cb(null, `${Date.now()}.${type[1]}`);
	},
});
const resumeUpload = multer({ storage: resumeStorage });

const postStorage = multer.diskStorage({
	destination: "media/posts/",
	filename: (req, file, cb) => {
		const type = file.mimetype.split("/");
		if (type[0] === "image") cb(null, `${Date.now()}.${type[1]}`);
	},
});
const postUpload = multer({ storage: postStorage });

const deleteProfilePicture = async (profilePicture) => {
	unlink(`./media/profilePictures/${profilePicture}`, (err) => {
		if (err) return;
	});
};

const deleteResume = async (resume) => {
	unlink(`./media/resumes/${resume}`, (err) => {
		if (err) return;
	});
};

module.exports = {
	profilePictureUpload,
	resumeUpload,
	postUpload,
	deleteProfilePicture,
	deleteResume,
};
