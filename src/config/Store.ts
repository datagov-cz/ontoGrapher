import { Store } from "pullstate";
import { DetailPanelMode, MainViewMode } from "./Enum";

interface StateAlerts {
  showCriticalAlert: boolean; // Display fullscreen non-dismissible alert
}

export const StoreAlerts = new Store<StateAlerts>({
  showCriticalAlert: false,
});

interface StateSettings {
  diagramPanelSelectedDiagram: string;
  // For diagram manager
  mainViewMode: MainViewMode;
  selectedDiagram: string;
  // For detail panel
  detailPanelMode: DetailPanelMode;
  detailPanelSelectedID: string;
}

export const StoreSettings = new Store<StateSettings>({
  mainViewMode: MainViewMode.CANVAS,
  detailPanelMode: DetailPanelMode.HIDDEN,
  detailPanelSelectedID: "",
  selectedDiagram: "",
  diagramPanelSelectedDiagram: "",
});
