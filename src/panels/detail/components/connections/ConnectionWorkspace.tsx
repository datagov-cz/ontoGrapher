import React from "react";
import { ReactComponent as HiddenElementSVG } from "../../../../svg/hiddenElement.svg";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { getDisplayLabel } from "../../../../function/FunctionDraw";
import _ from "underscore";
import { getOtherConnectionElementID } from "../../../../function/FunctionLink";
import { isElementHidden } from "../../../../function/FunctionElem";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import Connection from "./Connection";

interface Props {
  linkID: string;
  elemID: string;
  projectLanguage: string;
  selected: boolean;
  selection: string[];
  updateSelection: (ids: string[]) => void;
}

interface State {}

export default class ConnectionWorkspace extends React.Component<Props, State> {
  getConnectionDirection(id: string): boolean {
    return WorkspaceLinks[this.props.linkID].source === id;
  }

  transferConnectionToEvent(event: DragEvent, elemID: string) {
    event?.dataTransfer?.setData(
      "newClass",
      JSON.stringify({
        id: _.uniq(
          this.props.selection
            .filter((link) => link in WorkspaceLinks)
            .map((link) => getOtherConnectionElementID(link, this.props.elemID))
            .concat(elemID)
        ),
        iri: this.props.selection.filter((link) => !(link in WorkspaceLinks)),
      })
    );
  }

  render() {
    const elemID = getOtherConnectionElementID(
      this.props.linkID,
      this.props.elemID
    );
    return (
      <Connection
        onDragStart={(event: DragEvent) =>
          this.transferConnectionToEvent(event, elemID)
        }
        onDragEnd={() => {
          this.props.updateSelection(this.props.selection);
        }}
        onClick={() => this.props.updateSelection([this.props.linkID])}
        selected={this.props.selected}
        linkLabel={getLabelOrBlank(
          getLinkOrVocabElem(WorkspaceLinks[this.props.linkID].iri).labels,
          this.props.projectLanguage
        )}
        direction={this.getConnectionDirection(elemID)}
        markerID={this.props.linkID}
        elementLabel={
          <span>
            {getDisplayLabel(elemID, this.props.projectLanguage)}
            {isElementHidden(elemID, AppSettings.selectedDiagram) && (
              <span className={"hidden"}>
                &nbsp;
                <HiddenElementSVG />
              </span>
            )}
          </span>
        }
        backgroundColor={
          WorkspaceVocabularies[
            getVocabularyFromScheme(
              WorkspaceTerms[WorkspaceElements[elemID].iri].inScheme
            )
          ].color
        }
      />
    );
  }
}
