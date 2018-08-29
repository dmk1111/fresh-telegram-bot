const TelegramBot = require('node-telegram-bot-api');

const token = require('./credentials/token');
const { runCode } = require('./run_code/run_code.js');

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const task = `
I'm EPAM LvivJS drinks bot.

If you want to taste some fresh or smoothie, please complete following task:

Crete function to get ingredients for specific drink.
It receives index of item in <code>freshTitles</code> as argument.
<code>freshTitles</code> is a set with different drink names.
<pre>
const freshTitles = new Set([
  'orange',
  'orangeBanana',
  'apple'
]);
</pre>

<code>freshIngredients</code> is a map that has key - ingredient name, value - list of drinks that could be prepared from this ingredient
<pre>
const freshIngredients = new Map(Object.entries({
  orange: ['orange', 'orangeBanana'],
  banana: ['orangeBanana'],
  apple: ['apple']
}));
</pre>

You need to find drink by <code>id</code> and than find what ingredients we should use in order to prepare it for you

Generally, it should be something like this:
<pre>
function(index) {
    // ....magic is happening
    return resultArray;
}
</pre>

Send the code of function to me and I'll check if it works correctly.
Good luck!`;
  bot.sendMessage(chatId, `Hello, ${msg.from.first_name}! ${task}`, {parse_mode: 'HTML' });
});

bot.onText(/\/tips/, (msg) => {
    const chatId = msg.chat.id;
    const response = `Here you can read more about <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set">ES6 Set</a>.
And here is info about <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map">ES6 Map</a>.`;
    bot.sendMessage(chatId, response, {parse_mode: 'HTML' });
});

bot.onText(/^((?!(\/start)|(\/tips)).)*$/gm, async (msg) => {
  const chatId = msg.chat.id;
  try {
	const res = await runCode(msg.text);
	bot.sendMessage(chatId, `Good job: ${res}`);
  } catch (e) {
	bot.sendMessage(chatId, `Error: ${e}`);
  }
});