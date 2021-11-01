const { v4 } = require("uuid");

const currentDateTimestamp = () => {
	const current = new Date();

	const date = `${current.getDate()}/${
		current.getMonth() + 1
	}/${current.getFullYear()}`;

	const minutes = "0" + current.getMinutes().toString();
	const hours = "0" + current.getHours().toString();

	const time = `${hours.slice(hours.length - 2, 3)}:${minutes.slice(
		minutes.length - 2,
		3
	)}`;
	return date + " - " + time;
};

const getFormattedDate = (ms) => {
	const date = new Date(ms);
	const day = date.getDate(),
		month = date.getMonth() + 1,
		year = date.getFullYear();
	if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
	return `${day}/${month}/${year}`;
};

const idify = (arr) => {
	const newArr = arr.map((item) => {
		if (!item._id) return { _id: v4(), ...item };
		return item;
	});
	return newArr;
};

const timestampSplitter = (timestamp) => {
	const split = timestamp.split("-");
	const d = split[0].slice(0, split[0].length - 1),
		t = split[1].slice(1);
	const [day, month, year] = d.split("/");
	const [hours, minutes] = t.split(":");
	return { day, month, year, hours, minutes };
};

const sortPosts = (post1, post2) => {
	const date1 = timestampSplitter(post1.creationDate),
		date2 = timestampSplitter(post2.creationDate);
	return date1.year > date2.year ||
		date1.month > date2.month ||
		date1.day > date2.day ||
		date1.hours > date2.hours ||
		date1.minutes > date2.minutes
		? -1
		: 1;
};

const sortChats = (chat1, chat2) => {
	const lastText1 = chat1.chat[chat1.chat.length - 1], lastText2 = chat2.chat[chat2.chat.length - 1];
	return new Date(lastText1.dateTime) > new Date(lastText2.dateTime) ? -1 : 1;
}

module.exports = {
	currentDateTimestamp,
	getFormattedDate,
	idify,
	sortPosts,
	sortChats,
};
