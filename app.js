const TelegramBot = require("node-telegram-bot-api");

const token = require("./credentials/token");
const { runCode } = require("./run_code/run_code.js");
const drinks = require("./constants/drinks");
const ingredients = require("./constants/ingredients");
const { saveSuccessResult, saveFailedResult } = require("./save_result/save_result");

const users = new Map();

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/tips/, msg => {
	const chatId = msg.chat.id;
	const response = `Here you can read more about <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set">ES6 Set</a>.
And here is info about <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map">ES6 Map</a>.
Another free tip: try to use spread operator with Set ;)`;
	bot.sendMessage(chatId, response, { parse_mode: "HTML" });
});

bot.onText(/\/start/, msg => {
	const opts = {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: "Normal",
						callback_data: "normal_mode"
					},
					{
						text: "Hard",
						callback_data: "hard_mode"
					}
				]
			]
		}
	};
	bot.sendMessage(
		msg.from.id,
		`Hello, ${msg.from.first_name}!
I'm EPAM LvivJS drinks bot.

If you want to taste some fresh or smoothie, please, select task complexity and finish it successfully!`,
		opts
	);
});

bot.onText(/^((?!(\/start)|(\/tips)).)*$/gm, async msg => {
	const chatId = msg.chat.id;
	const isHard = users.get(chatId) | false;
	try {
		const result = await runCode(msg.text, isHard);
		bot.sendMessage(chatId, `Good job: ${result.message}.\nYou did it with ${result.codeLength} symbols!`);
		saveSuccessResult([msg.from.id, msg.from.first_name, result.codeLength, msg.text]);
	} catch (e) {
		bot.sendMessage(chatId, `Error: ${e}`);
		saveFailedResult([msg.from.id, msg.from.first_name, msg.text]);
	}
});

bot.on("callback_query", function onCallbackQuery(callbackQuery) {
	const action = callbackQuery.data;
	const msg = callbackQuery.message;
	const opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id
	};

	if (action === "normal_mode") {
		users.set(opts.chat_id, false);
		const task = getTask(false);
		bot.sendMessage(opts.chat_id, `${task}`, { parse_mode: "HTML" });
	} else if (action === "hard_mode") {
		users.set(opts.chat_id, true);
		const task = getTask(true);
		bot.sendMessage(opts.chat_id, `${task}`, { parse_mode: "HTML" });
	}
});

const hardTask = `<code>drinks</code> is a set with different drink names.
<pre>
const drinks = new Set(${JSON.stringify(drinks, null, 2)});
</pre>

<code>ingredients</code> is a map that has key - ingredient name, value - list of drinks that could be prepared from this ingredient
<pre>
const ingredients = new Map(Object.entries(${JSON.stringify(ingredients, null, 2)}));
</pre>

In case you need to refresh your ES6 knowledge, select /tips and I'll provide you with some links`;

const normalTask = `<code>drinks</code> is an array with different drink names.
<pre>
const drinks = ${JSON.stringify(drinks, null, 2)};
</pre>

<code>ingredients</code> is an object that has key - ingredient name, value - list of drinks that could be prepared from this ingredient
<pre>
const ingredients = ${JSON.stringify(ingredients, null, 2)};
</pre>`;

function getTask(hard = false) {
	return `${hard ? "HARD MODE ON!!!" : "Ok, here you go:"}

Create function to get ingredients for specific drink.
It receives <code>index</code> of item in <code>drinks</code> as argument.
${hard ? hardTask : normalTask}

You need to find drink by <code>index</code> and than find what ingredients we should use in order to prepare it for you

Generally, it should be something like this:
<pre>
function(index) {
    // ....magic is happening
    return resultArray;
}
</pre>

Send the code of function to me and I'll check if it works correctly.
Good luck!

P.S. In case you want to change difficulty, choose /start again`;
}
