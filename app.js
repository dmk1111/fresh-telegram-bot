const TelegramBot = require('node-telegram-bot-api');

const token = require('./credentials/token');
const { runCode } = require('./run_code/run_code.js');

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const task = `
I'm EPAM LvivJS fresh bot.
If you want to taste some fresh please complete following task:

const freshTitles = [
  'orange',
  'orangeBanana',
  'apple'
];

const freshIngredients = {
  orange: ['orange', 'orangeBanana'],
  banana: ['orangeBanana'],
  apple: ['apple']
};

Define function getIngredientsByTitleIndex that will take index of freshTitle on input and will return array of fresh ingredients for corresponding fresh.

Send the code of function to me.
Good luck!`;
  bot.sendMessage(chatId, `Hello, ${msg.from.first_name}! ${task}`);
});

bot.onText(/^((?!\/start).)*$/gm, async (msg) => {
  const chatId = msg.chat.id;
  try {
	const res = await runCode(msg.text);
	bot.sendMessage(chatId, `Good job: ${res}`);
  } catch (e) {
	bot.sendMessage(chatId, `Error: ${e}`);
  }
});