const TelegramBot = require("node-telegram-bot-api");

const token = require("./credentials/token");
const { runCode } = require("./run_code/run_code.js");

const users = new Map();

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/tips/, (msg) => {
    const chatId = msg.chat.id;
    const response = `Here you can read more about <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set">ES6 Set</a>.
And here is info about <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map">ES6 Map</a>.
Another free tip: try to use spread operator with Set ;)`;
    bot.sendMessage(chatId, response, { parse_mode: "HTML" });
});

bot.onText(/\/start/, (msg) => {
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
    bot.sendMessage(msg.from.id, `Hello, ${msg.from.first_name}! 
I'm EPAM LvivJS drinks bot.

If you want to taste some fresh or smoothie, please, select task complexity and finish it successfully!`, opts);
});

bot.onText(/^((?!(\/start)|(\/tips)).)*$/gm, async (msg) => {
    const chatId = msg.chat.id;
    const isHard = users.get(chatId) | false;
    try {
        const res = await runCode(msg.text, isHard);
        bot.sendMessage(chatId, `Good job: ${res}`);
    } catch (e) {
        bot.sendMessage(chatId, `Error: ${e}`);
    }
});

bot.on("callback_query", function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
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

const hardTask = `<code>freshTitles</code> is a set with different drink names.
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

In case you need to refresh your ES6 knowledge, select /tips and I'll provide you with some links`;

const normalTask = `<code>freshTitles</code> is an array with different drink names.
<pre>
const freshTitles = [
  'orange',
  'orangeBanana',
  'apple'
];
</pre>

<code>freshIngredients</code> is an object that has key - ingredient name, value - list of drinks that could be prepared from this ingredient
<pre>
const freshIngredients = {
  orange: ['orange', 'orangeBanana'],
  banana: ['orangeBanana'],
  apple: ['apple']
};
</pre>`;

function getTask(hard = false) {
    return `${hard ? "HARD MODE ON!!!" : "Ok, here you go:"}

Create function to get ingredients for specific drink.
It receives <code>index</code> of item in <code>freshTitles</code> as argument.
${hard ? hardTask : normalTask }

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