const drinksArray = require("../constants/drinks");
const ingredientsObj = require("../constants/ingredients");
//The codeRunner.js is ran in a separate process and just listens for the message which contains code to be executed

process.on("message", function({ jsCodeString, hardMode }) {
	const vm = require("vm");
	const obj = {};
	const ctx = vm.createContext(obj);

	try {
		const script = hardMode
			? new vm.Script(`
		const drinks = new Set(${JSON.stringify(drinksArray)});
		const ingredients = new Map(Object.entries(${JSON.stringify(ingredientsObj)}));
		var getIngredients = ${jsCodeString};
		`)
			: new vm.Script(`
		const drinks = ${JSON.stringify(drinksArray)};
		const ingredients = ${JSON.stringify(ingredientsObj)};
		var getIngredients = ${jsCodeString};
		`);
		script.runInNewContext(ctx);
		let result = `
getIngredients(0) output: ${JSON.stringify(
			ctx["getIngredients"](0)
		)}, expected output: ["pear", "banana", "celery"];
getIngredients(2) output: ${JSON.stringify(
			ctx["getIngredients"](2)
		)}, expected output: ["pear", "banana", "apple", "orange"];
getIngredients(4) output: ${JSON.stringify(
			ctx["getIngredients"](4)
		)}, expected output: ["carrot", "apple", "orange", "broccoli", "spinach"];\n`;
		if (
			JSON.stringify(ctx["getIngredients"](0).sort()) ===
				JSON.stringify(["pear", "banana", "celery"].sort()) &&
			JSON.stringify(ctx["getIngredients"](2).sort()) ===
				JSON.stringify(["pear", "banana", "apple", "orange"].sort()) &&
			JSON.stringify(ctx["getIngredients"](4)) ===
				JSON.stringify(["carrot", "apple", "orange", "broccoli", "spinach"])
		) {
			process.send({
				message: (result += "Please choose your fresh!"),
				codeLength: jsCodeString.length
			});
		} else {
			process.send({ error: (result += "Invalid function, please try again.") });
		}
	} catch (error) {
		process.send({ error: error.message });
	}
});
