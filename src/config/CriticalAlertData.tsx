import { StoreAlerts } from "./Store";

export var CriticalAlertData: {
  acceptFunction: Function;
  waitForFunctionBeforeModalClose: boolean;
  innerContent: JSX.Element;
  acceptLabel: string;
} = {
  acceptFunction: () => {},
  waitForFunctionBeforeModalClose: true,
  innerContent: <div />,
  acceptLabel: "",
};

export function callCriticalAlert(data: typeof CriticalAlertData) {
  CriticalAlertData = data;
  StoreAlerts.update((s) => (s.showCriticalAlert = true));
}
