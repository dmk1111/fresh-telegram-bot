const google = require("googleapis");
const spreadsheets = google.sheets("v4").spreadsheets;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const googleKeys = require("../credentials/google_client_secret.json");

const spreadsheetId = require("../constants/spreadsheet_id");

function authorizeGoogleAPI(callback, ...args) {
	const client = new google.auth.JWT(googleKeys.client_email, null, googleKeys.private_key, SCOPES, null);
	client.authorize(function(err) {
		if (err) {
			console.log(err);
			throw new Error("AUTH ISSUE WITH GOOGLE");
		}
		callback(client, ...args);
	});
}

function updateResultsTable(auth, values, sheetRange) {
	const resource = {
		majorDimension: "ROWS",
		values: [values]
	};
	spreadsheets.values.append(
		{
			auth: auth,
			valueInputOption: "RAW",
			spreadsheetId: spreadsheetId,
			range: sheetRange,
			resource: resource
		},
		err => {
			if (err) {
				console.log(`Saving result failed: ${err}`);
			}
		}
	);
}

function saveSuccessResult(values) {
	authorizeGoogleAPI(updateResultsTable, values, "Success Results!A:A");
}

function saveFailedResult(values) {
	authorizeGoogleAPI(updateResultsTable, values, "Failed Results!A:A");
}

module.exports = {
	saveSuccessResult,
	saveFailedResult
};
