import { AppSettings } from "../config/Variables";
import { keycloak } from "../config/Keycloak";

export async function processTransaction(
  contextEndpoint: string,
  transaction: string
): Promise<boolean> {
  if (!transaction) return true;
  AppSettings.lastTransaction = transaction;
  const miliseconds = 15000;
  const controller = new AbortController();
  const signal = controller.signal;
  let timeout = window.setTimeout(() => controller.abort(), miliseconds);

  const transactionUrl = contextEndpoint + "/transactions";

  const transactionID = await fetch(transactionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keycloak.token}`,
    },
    signal,
  })
    .then((response) => response.headers)
    .then((headers) => {
      let location = headers.get("location");
      if (location) return location;
      else return undefined;
    })
    .catch(() => undefined);

  if (transactionID) {
    AppSettings.lastTransactionID = transactionID;

    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      controller.abort();
      abortTransaction(transactionID);
    }, miliseconds);
    const resultUpdate = await fetch(transactionID + "?action=UPDATE", {
      headers: {
        "Content-Type": "application/sparql-update; charset=UTF-8",
        Authorization: `Bearer ${keycloak.token}`,
      },
      method: "PUT",
      body: transaction,
      signal,
    })
      .then((response) => response.ok)
      .catch(() => false);
    if (!resultUpdate) {
      console.error(transaction);
      await abortTransaction(transactionID);
      return false;
    }

    const resultCommit = await fetch(transactionID + "?action=COMMIT", {
      method: "PUT",
      headers: { Authorization: `Bearer ${keycloak.token}` },
      signal,
    })
      .then((response) => response.ok)
      .catch(() => false);
    window.clearTimeout(timeout);
    if (resultCommit) {
      AppSettings.lastTransactionID = "";
      return true;
    } else {
      await abortTransaction(transactionID);
      return false;
    }
  } else return false;
}

export async function abortTransaction(transaction: string): Promise<boolean> {
  return await fetch(transaction, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${keycloak.token}` },
    keepalive: true,
  })
    .then((response) => {
      AppSettings.lastTransactionID = "";
      return response.ok;
    })
    .catch(() => false);
}

export function processQuery(
  endpoint: string,
  query: string,
  auth: boolean = endpoint === AppSettings.contextEndpoint
): Promise<Response> {
  const q = endpoint + "?query=" + encodeURIComponent(query);
  return fetch(q, {
    headers: auth
      ? {
          Accept: "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        }
      : { Accept: "application/json" },
  });
}
