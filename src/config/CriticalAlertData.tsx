import { StoreAlerts } from "./Store";

export var CriticalAlertData: {
  acceptFunction: Function;
  waitForFunctionBeforeModalClose: boolean;
  innerContent: JSX.Element;
  acceptLabel: string;
  modalSize?: "sm" | "lg" | "xl";
} = {
  acceptFunction: () => {},
  waitForFunctionBeforeModalClose: true,
  innerContent: <div />,
  acceptLabel: "",
  modalSize: "sm",
};

export function callCriticalAlert(data: typeof CriticalAlertData) {
  CriticalAlertData = data;
  StoreAlerts.update((s) => {
    s.showCriticalAlert = true;
  });
}
