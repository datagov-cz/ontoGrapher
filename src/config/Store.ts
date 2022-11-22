import { Store } from "pullstate";
import { MainViewMode } from "./Enum";

interface StateAlerts {
  showCriticalAlert: boolean; // Display fullscreen non-dismissible alert
}

interface StateSettings {
  mainViewMode: MainViewMode;
}

export const StoreAlerts = new Store<StateAlerts>({
  showCriticalAlert: false,
});

export const StoreSettings = new Store<StateSettings>({
  mainViewMode: MainViewMode.CANVAS,
});
