const { Account, Message } = require("../schema/models");
const { getAccountId } = require("../utils/auth");
const {
	Types: { ObjectId },
} = require("mongoose");

const socketIds = {};

const addSocketId = (socketId, accountId) => {
	if (!socketIds[accountId]) socketIds[accountId] = [];
	socketIds[accountId].push(socketId);
};

const sendMessage = async (socket, from, to, text) => {
	if (!from || !to || !text || socket.accountId !== from) return;
	const exists = await Account.exists({ _id: ObjectId(to) });
	if (!exists) return;

	const message = new Message({from, to, text, dateTime: new Date().toString()});
	await message.save()

	if (socketIds[to]) {
		socketIds[to].forEach((socketId) => {
			socket.to(socketId).emit("message", {success: true, body: {message}});
		});
	}
};

const socketConnection = async (socket) => {
	const accessToken = socket.handshake.headers.cookie.split("=")[1];
	socket.accountId = await getAccountId(accessToken);
	addSocketId(socket.id, socket.accountId);

	socket.on("message", ({ from, to, text }) =>
		sendMessage(socket, from, to, text)
	);
	socket.on("disconnect", () => {
		socketIds[socket.accountId] = [];
	});
};

module.exports = socketConnection;
