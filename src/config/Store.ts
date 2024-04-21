import { Store } from "pullstate";
import { DetailPanelMode, MainViewMode } from "./Enum";

interface StateAlerts {
  showCriticalAlert: boolean; // Display fullscreen non-dismissible alert
}

export const StoreAlerts = new Store<StateAlerts>({
  showCriticalAlert: false,
});

interface StateSettings {
  toastQueue: string[];
  diagramPanelSelectedDiagram: string;
  tropeOverlay: string;
  // For diagram manager
  mainViewMode: MainViewMode;
  selectedDiagram: string;
  // For detail panel
  detailPanelMode: DetailPanelMode;
  detailPanelSelectedID: string;
}

export const StoreSettings = new Store<StateSettings>({
  toastQueue: [],
  tropeOverlay: "",
  mainViewMode: MainViewMode.CANVAS,
  detailPanelMode: DetailPanelMode.HIDDEN,
  detailPanelSelectedID: "",
  selectedDiagram: "",
  diagramPanelSelectedDiagram: "",
});
