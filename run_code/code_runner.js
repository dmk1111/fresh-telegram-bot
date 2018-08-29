//The codeRunner.js is ran in a separate process and just listens for the message which contains code to be executed
process.on("message", function({ jsCodeString }) {
	const vm = require("vm");
	const obj = {};
	const ctx = vm.createContext(obj);

    const freshTitlesArray = [
        'orange',
        'orangeBanana',
        'apple'
    ];

    const freshIngredientsObj = {
        orange: ['orange', 'orangeBanana'],
        banana: ['orangeBanana'],
        apple: ['apple']
    };

	const freshTitles = new Set(freshTitlesArray);

	const freshIngredients = new Map(Object.entries(freshIngredientsObj));

	try {
		const script = new vm.Script(`
		const freshTitles = new Set(${JSON.stringify(freshTitlesArray)});
		const freshIngredients = new Map(Object.entries(${JSON.stringify(freshIngredientsObj)}));
		var getIngredientsByTitleIndex = ${jsCodeString};
		`);
		script.runInNewContext(ctx);
		let result = `
getIngredientsByTitleIndex(0) output: ${JSON.stringify(ctx['getIngredientsByTitleIndex'](0))}, expected output: ["orange"];
getIngredientsByTitleIndex(1) output: ${JSON.stringify(ctx['getIngredientsByTitleIndex'](1))}, expected output: ["orange", "banana"];
getIngredientsByTitleIndex(2) output: ${JSON.stringify(ctx['getIngredientsByTitleIndex'](2))}, expected output: ["apple"];\n`;
		if (
			JSON.stringify(ctx['getIngredientsByTitleIndex'](0)) === JSON.stringify(["orange"]) &&
			JSON.stringify(ctx['getIngredientsByTitleIndex'](1).sort()) === JSON.stringify(["orange", "banana"].sort()) &&
			JSON.stringify(ctx['getIngredientsByTitleIndex'](2)) === JSON.stringify(["apple"])
		) {
			process.send( result += 'Please choose your fresh!');
		} else {
			process.send({ error: result += 'Invalid function, please try again.' });
		}
	} catch (error) {
		process.send({ error: error.message });
	}
});