import { Store } from "pullstate";

interface StateAlerts {
  showCriticalAlert: boolean; // Display fullscreen non-dismissible alert
}

export const StoreAlerts = new Store<StateAlerts>({
  showCriticalAlert: false,
});
