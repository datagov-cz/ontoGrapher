import {ProjectSettings} from "../config/Variables";

export async function processTransaction(contextEndpoint: string, transaction: string): Promise<boolean> {
	if (!transaction)
		return true;
	ProjectSettings.lastTransaction = transaction;
	let miliseconds = 15000;
	let controller = new AbortController();
	const signal = controller.signal;
	let timeout = window.setTimeout(() => controller.abort(), miliseconds);

	let transactionUrl = contextEndpoint + "/transactions";

	const transactionID = await fetch(transactionUrl, {
		method: "POST",
		signal
	}).then(response => response.headers).then(
		headers => {
			let location = headers.get("location");
			if (location) return location;
			else return undefined;
		}
	).catch(() => undefined);

	if (transactionID) {
		ProjectSettings.lastTransactionID = transactionID;

		window.clearTimeout(timeout);
		timeout = window.setTimeout(() => {
			controller.abort();
			abortTransaction(transactionID);
		}, miliseconds);
		let resultUpdate = await fetch(transactionID + "?action=UPDATE", {
			headers: {
				'Content-Type': 'application/sparql-update; charset=UTF-8'
			},
			method: "PUT",
			body: transaction,
			signal
		}).then(response => response.ok).catch(() => false);
		if (!resultUpdate) {
			console.log(transaction);
			await abortTransaction(transactionID);
			return false;
		}

		let resultCommit = await fetch(transactionID + "?action=COMMIT", {
			method: "PUT",
			signal
		}).then(response => response.ok).catch(() => false);
		window.clearTimeout(timeout);
		if (resultCommit) {
			ProjectSettings.lastTransactionID = "";
			return true;
		} else {
			await abortTransaction(transactionID);
			return false;
		}
	} else return false;
}

export async function abortTransaction(transaction: string) {
	return await fetch(transaction, {
		method: "DELETE",
		keepalive: true
	}).then(response => {
		ProjectSettings.lastTransactionID = "";
		return response.ok;
	}).catch(() => false);
}