import { AppSettings } from "../config/Variables";
import { getToken } from "@opendata-mvcr/assembly-line-shared";
import { Environment } from "../config/Environment";

export async function processTransaction(
  contextEndpoint: string,
  ...transactions: string[]
): Promise<boolean> {
  AppSettings.lastTransactions = transactions;
  for (const transaction of transactions) {
    if (!transaction) continue;
    const timeoutDeadline = 15000;
    const controller = new AbortController();
    const signal = controller.signal;
    let timeout = window.setTimeout(() => controller.abort(), timeoutDeadline);

    const transactionUrl = contextEndpoint + "/transactions";

    const transactionID = await fetch(transactionUrl, {
      method: "POST",
      headers: {
        Authorization: `${getToken()}`,
      },
      signal,
    })
      .then((response) => response.headers)
      .then((headers) => {
        let location = headers.get("location");
        if (location) return location;
        else return undefined;
      })
      .catch((e) => {
        console.error(e);
        return undefined;
      });

    if (transactionID) {
      AppSettings.lastTransactionID = transactionID;

      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        controller.abort();
        abortTransaction(transactionID);
      }, timeoutDeadline);
      const resultUpdate = await fetch(transactionID + "?action=UPDATE", {
        headers: {
          "Content-Type": "application/sparql-update; charset=UTF-8",
          ...(Environment.auth && { Authorization: `${getToken()}` }),
        },
        method: "PUT",
        body: transaction,
        signal,
      })
        .then((response) => response.ok)
        .catch((e) => {
          console.error(e);
          return false;
        });
      if (!resultUpdate) {
        console.error(transaction);
        await abortTransaction(transactionID);
        return false;
      }
      const resultCommit = await fetch(transactionID + "?action=COMMIT", {
        method: "PUT",
        headers: {
          ...(Environment.auth && { Authorization: `${getToken()}` }),
        },
        signal,
      })
        .then((response) => response.ok)
        .catch((e) => {
          console.error(e);
          return false;
        });
      window.clearTimeout(timeout);
      if (resultCommit) {
        AppSettings.lastTransactionID = "";
      } else {
        await abortTransaction(transactionID);
        return false;
      }
    } else return false;
  }
  return true;
}

export async function abortTransaction(transaction: string): Promise<boolean> {
  return await fetch(transaction, {
    method: "DELETE",
    headers: {
      ...(Environment.auth && { Authorization: `${getToken()}` }),
    },
    keepalive: true,
  })
    .then((response) => {
      AppSettings.lastTransactionID = "";
      return response.ok;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

export function processQuery(
  endpoint: string,
  query: string,
  auth: boolean = Environment.auth && endpoint === AppSettings.contextEndpoint
): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    body: "query=" + encodeURIComponent(query),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      ...(auth && { Authorization: `${getToken()}` }),
    },
  });
}
