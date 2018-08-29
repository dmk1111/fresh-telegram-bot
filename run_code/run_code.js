const cluster = require("cluster");

cluster.setupMaster({
	exec: "./run_code/code_runner.js",
	silent: false
});

/**
 * Executes function from students code with given args and returns Promise with result of execution
 * @param   {string}  studentCode
 * @returns {Promise<any>}
 */

async function runCode(jsCodeString) {
	return new Promise((resolve, reject) => {
		let timer = 0;
		const worker = cluster.fork();
		worker.send({ jsCodeString});
		worker.on("message", function(result) {
			clearTimeout(timer); //The worker responded in under 5 seconds, clear the timeout
			if (result.error) {
				reject(result.error);
			} else {
				resolve(result);
			}
			worker.destroy(); //Don't leave him hanging
		});
		timer = setTimeout(function() {
			worker.destroy(); //Give it 5 seconds to run, then abort it
			reject("timed out");
		}, 5000);
	});
}

module.exports = {
	runCode: runCode
};
