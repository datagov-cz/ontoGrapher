import { useStoreState } from "pullstate";
import React from "react";
import {
  ElemCreationConfiguration,
  LinkCreationConfiguration,
} from "../components/modals/CreationModals";
import { DetailPanelMode, MainViewMode } from "../config/Enum";
import { StoreSettings } from "../config/Store";
import { DiagramManager } from "./DiagramManager";
import DiagramCanvas from "./DiagramCanvas";

type Props = {
  freeze: boolean;
  updateElementPanel: (id?: string, redoCacheSearch?: boolean) => void;
  updateDetailPanel: (mode: DetailPanelMode, id?: string) => void;
  performTransaction: (...queries: string[]) => void;
  handleCreation: (
    configuration: LinkCreationConfiguration | ElemCreationConfiguration
  ) => void;
  handleStatus: (
    loading: boolean,
    status: string,
    freeze: boolean,
    retry: boolean
  ) => void;
  projectLanguage: string;
  update: () => void;
  setPositionOrScaleTimeout: (diagram: string) => void;
};

export const MainView: React.FC<Props> = (props: Props) => {
  const mode = useStoreState(StoreSettings, (s) => s.mainViewMode);
  const getStyle = () => {
    const diagramPanel = document.getElementById("diagramPanel");
    const menuPanel = document.getElementById("menuPanel");
    const subtract =
      (diagramPanel ? diagramPanel.offsetHeight : 81) +
      (menuPanel ? menuPanel.offsetHeight : 31);
    return {
      cursor: props.freeze ? "not-allowed" : "inherit",
      opacity: props.freeze ? "0.5" : "1",
      height: `calc(100vh - ${subtract}px)`,
    };
  };
  let timer: NodeJS.Timeout;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(getStyle, 200);
  });
  return (
    <div className={"mainView"} id={"mainView"} style={getStyle()}>
      {mode === MainViewMode.CANVAS && (
        <DiagramCanvas
          setPositionOrScaleTimeout={props.setPositionOrScaleTimeout}
          projectLanguage={props.projectLanguage}
          updateElementPanel={props.updateElementPanel}
          updateDetailPanel={props.updateDetailPanel}
          freeze={props.freeze}
          performTransaction={props.performTransaction}
          handleCreation={props.handleCreation}
          handleStatus={props.handleStatus}
        />
      )}
      {mode === MainViewMode.MANAGER && (
        <DiagramManager
          projectLanguage={props.projectLanguage}
          performTransaction={props.performTransaction}
          update={props.update}
          freeze={props.freeze}
        />
      )}
    </div>
  );
};
