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
		var getIngredientsByDrinkIndex = ${jsCodeString};
		`)
			: new vm.Script(`
		const drinks = ${JSON.stringify(drinksArray)};
		const ingredients = ${JSON.stringify(ingredientsObj)};
		var getIngredientsByDrinkIndex = ${jsCodeString};
		`);
		script.runInNewContext(ctx);
		let result = `
getIngredientsByDrinkIndex(0) output: ${JSON.stringify(
			ctx["getIngredientsByDrinkIndex"](0)
		)}, expected output: ["orange"];
getIngredientsByDrinkIndex(1) output: ${JSON.stringify(
			ctx["getIngredientsByDrinkIndex"](1)
		)}, expected output: ["orange", "banana"];
getIngredientsByDrinkIndex(2) output: ${JSON.stringify(
			ctx["getIngredientsByDrinkIndex"](2)
		)}, expected output: ["apple"];\n`;
		if (
			JSON.stringify(ctx["getIngredientsByDrinkIndex"](0)) === JSON.stringify(["orange"]) &&
			JSON.stringify(ctx["getIngredientsByDrinkIndex"](1).sort()) === JSON.stringify(["orange", "banana"].sort()) &&
			JSON.stringify(ctx["getIngredientsByDrinkIndex"](2)) === JSON.stringify(["apple"])
		) {
			process.send((result += "Please choose your fresh!"));
		} else {
			process.send({ error: (result += "Invalid function, please try again.") });
		}
	} catch (error) {
		process.send({ error: error.message });
	}
});
