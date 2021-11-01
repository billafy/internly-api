const { Router } = require("express");
const {
	getInternship,
	getInternships,
	createInternship,
	getCompanyInternships,
	applyInternship,
	updateApplicationStatus,
	myAppliedInternships,
} = require("../controllers/internshipsController");
const { verifyAccessToken } = require("../utils/auth");

const router = Router();

router.get("/getInternship/:internshipId", getInternship);
router.get("/getInternships", getInternships);
router.get("/getCompanyInternships/:_id", verifyAccessToken, getCompanyInternships)
router.get("/myAppliedInternships/:_id", verifyAccessToken, myAppliedInternships)

router.post("/createInternship/:_id", verifyAccessToken, createInternship);

router.put('/applyInternship/:internshipId/:_id', verifyAccessToken, applyInternship);
router.put('/updateApplicationStatus/:_id/:internshipId/:applicationId', verifyAccessToken, updateApplicationStatus);

module.exports = router;
