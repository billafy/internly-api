/* central server setup */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");

const socketConnection = require("./app/socket/socketConnection");
const { authenticateToken } = require("./app/utils/auth");

const accountsRouter = require("./app/routers/accountsRouter");
const internshipsRouter = require("./app/routers/internshipsRouter");
const socialRouter = require("./app/routers/socialRouter");

require("dotenv").config();

/* app configurations */

const app = express();
const port = process.env.PORT || 5000;

/* middlewares */

app.use(cookieParser());
app.use(express.json());
app.use(
	cors({
		origin: [
			"https://restify.vercel.app",
			"http://localhost:3000",
			"https://internly.vercel.app",
		],
		credentials: true,
		sameSite: "None",
		secure: true,
	})
);

/* mongodb database connection */

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});
mongoose.connection.on("error", () => {
	console.log("Error connecting to database");
});
mongoose.connection.on("open", () => {
	console.log("Connected to database");
});

/* api */

app.use("/accounts", accountsRouter);
app.use("/internships", internshipsRouter);
app.use("/social", socialRouter);

/* making the app listen to a port */

const server = app.listen(port, () => {
	console.log(`App listening port ${port}`);
});

/* socket */

const io = socketIo(server, {
	cors: {
		origin: ["http://localhost:3000", 'https://internly.vercel.app'],
		credentials: true,
		sameSite: "None",
		secure: true,
	},
});
io.on("connection", socketConnection);

module.exports = app;
