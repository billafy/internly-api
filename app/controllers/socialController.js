const { Account, Post, Message } = require("../schema/models");
const { sortPosts, currentDateTimestamp, sortChats } = require("../utils/utils");
const { accountExists } = require("../utils/validators");
const { idify } = require("../utils/utils");

const commentPopulate = {
	path: "comments",
	populate: {
		path: "commentedBy",
	},
};

const getTimeline = async (req, res) => {
	const { _id } = req.account;
	const account = await Account.findById(_id, ["following"]);
	const followingIds = [
		_id,
		...account.following.map((following) => following),
	];
	let posts = await Post.find({ postedBy: followingIds })
		.populate("postedBy")
		.populate(commentPopulate);
	posts.sort(sortPosts);
	res.json({ success: true, body: { posts } });
};

const getPosts = async (req, res) => {
	const { _id } = req.params;
	const posts = await Post.find({ postedBy: _id })
		.populate("postedBy")
		.populate(commentPopulate);
	posts.sort(sortPosts);
	res.json({ success: true, body: { posts } });
};

const createPost = async (req, res) => {
	const {
		params: { _id },
		body: { content },
	} = req;
	let filename = "";
	if (req.file) filename = req.file.filename;
	if (!content && !filename)
		return res.json({
			success: false,
			body: {
				error: "A post should contain either content or a media file.",
			},
		});
	const post = new Post({
		content: content || "",
		media: filename || "",
		likes: [],
		comments: [],
		accountId: _id,
		postedBy: _id,
		creationDate: currentDateTimestamp(),
	});
	await post.save();
	res.json({ success: true, post });
};

const deletePost = async (req, res) => {
	const {
		params: { postId },
	} = req;
	const _id = req.account._id.toString();
	const post = await Post.findById(postId).populate("postedBy");
	if (!post)
		return res.json({
			success: false,
			body: { error: "Post does not exists." },
		});
	if (_id !== post.postedBy._id.toString())
		return res.json({
			success: false,
			body: { error: "Not authorized to delete this post." },
		});
	await Post.findByIdAndDelete(postId);
	res.json({ success: true });
};

const likePost = async (req, res) => {
	const {
		params: { postId },
	} = req;
	const _id = req.account._id.toString();
	let post = await Post.findById(postId)
		.populate("postedBy")
		.populate(commentPopulate);
	if (!post)
		return res.json({
			success: false,
			body: { error: "Post does not exists." },
		});
	const likes = post.likes.map((like) => like.toString());
	if (likes.includes(_id))
		post.likes = post.likes.filter((like) => like.toString() !== _id);
	else post.likes.push(_id);
	await post.save();
	res.json({ success: true, body: { post } });
};

const commentPost = async (req, res) => {
	const {
		params: { postId },
		body: { text },
	} = req;
	const _id = req.account._id.toString();
	let post = await Post.findById(postId)
		.populate("postedBy")
		.populate(commentPopulate);
	if (!post)
		return res.json({
			success: false,
			body: { error: "Post does not exists." },
		});
	if (!text)
		return res.json({
			success: false,
			body: { error: "Comment cannot be empty." },
		});
	post.comments = idify([
		...post.comments,
		{ text, commentedBy: _id, likes: 0 },
	]);
	await post.save();
	post = await Post.findById(postId)
		.populate("postedBy")
		.populate(commentPopulate);
	res.json({ success: true, body: { post } });
};

const deleteComment = async (req, res) => {
	const {
		params: { postId, commentId },
	} = req;
	const _id = req.account._id.toString();
	let post = await Post.findById(postId)
		.populate("postedBy")
		.populate(commentPopulate);
	if (!post)
		return res.json({
			success: false,
			body: { error: "Post does not exists." },
		});
	post.comments = post.comments.filter((comment) => {
		if (
			_id === comment.commentedBy._id.toString() &&
			commentId === comment._id
		)
			return false;
		return true;
	});
	await post.save();
	res.json({ success: true, body: { post } });
};

const followAccount = async (req, res) => {
	const {
		params: { accountId },
	} = req;
	const _id = req.account._id.toString();
	const followingAccount = await Account.findById(accountId);
	if (!followingAccount)
		return res.json({
			success: false,
			body: { error: "Account does not exists." },
		});
	let account = await Account.findById(_id);
	if (account.following.includes(accountId)) {
		followingAccount.followers = followingAccount.followers.filter(
			(follower) => follower !== _id
		);
		account.following = account.following.filter(
			(following) => following !== accountId
		);
	} else {
		followingAccount.followers.push(_id);
		account.following.push(accountId);
	}
	await followingAccount.save();
	await account.save();
	res.json({ success: true, body: { account, followingAccount } });
};

const getChats = async (req, res) => {
	const _id = req.account._id;
	const messages = await Message.find({ $or: [{ from: _id }, { to: _id }] }).populate('from').populate('to');
	let chats = {}
	messages.forEach(message => {
		const to = message.to._id.toString(), from = message.from._id.toString();
		if(to === _id) {
			if(!chats[from]) 
				chats[from] = [];
			chats[from].push(message);
		}
		else {
			if(!chats[to]) 
				chats[to] = [];
			chats[to].push(message);
		}
	})
	chats = Object.values(chats).map(chat => {
		const newChat = chat.map(message => ({_id: message._id, text: message.text, from: message.from._id, to: message.to._id, dateTime: message.dateTime}))
		if(chat[0].from._id.toString() === _id) 
			return {account: chat[0].to, chat: newChat} 
		else 
			return {account: chat[0].from, chat: newChat}
	})
	chats.sort(sortChats);
	res.json({ success: true, body: { chats } });
};

module.exports = {
	getPosts,
	getTimeline,
	createPost,
	likePost,
	followAccount,
	commentPost,
	deleteComment,
	deletePost,
	getChats,
};