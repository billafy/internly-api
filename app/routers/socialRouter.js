const { Router } = require("express");
const {
	getTimeline,
	createPost,
	likePost,
	followAccount,
	getPosts,
	commentPost,
	deleteComment,
	deletePost,
	getChats,
} = require("../controllers/socialController");
const { verifyAccessToken } = require("../utils/auth");
const { postUpload } = require("../utils/staticStorage");

const router = Router();

router.get("/getPosts/:_id", getPosts);
router.get("/getTimeline/:_id", verifyAccessToken, getTimeline);
router.get('/getChats/:_id', verifyAccessToken, getChats);

router.post(
	"/createPost/:_id",
	verifyAccessToken,
	postUpload.single("post"),
	createPost
);
router.put("/likePost/:postId", verifyAccessToken, likePost);
router.put("/followAccount/:accountId", verifyAccessToken, followAccount);
router.put("/commentPost/:postId", verifyAccessToken, commentPost);

router.delete('/deleteComment/:postId/:commentId', verifyAccessToken, deleteComment)
router.delete('/deletePost/:postId', verifyAccessToken, deletePost)

module.exports = router;
