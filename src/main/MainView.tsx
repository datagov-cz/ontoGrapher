import { useStoreState } from "pullstate";
import React from "react";
import {
  ElemCreationConfiguration,
  LinkCreationConfiguration,
} from "../components/modals/CreationModals";
import { DetailPanelMode, MainViewMode } from "../config/Enum";
import { StoreSettings } from "../config/Store";
import { DiagramManager } from "../panels/diagram/DiagramManager";
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
  update: Function;
};

export const MainView: React.FC<Props> = (props: Props) => {
  const mode = useStoreState(StoreSettings, (s) => s.mainViewMode);
  return (
    <div
      className={"mainView"}
      style={{
        cursor: props.freeze ? "not-allowed" : "inherit",
        opacity: props.freeze ? "0.5" : "1",
      }}
    >
      {mode === MainViewMode.CANVAS && (
        <DiagramCanvas
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
