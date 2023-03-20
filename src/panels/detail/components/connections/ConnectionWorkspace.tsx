import React from "react";
import _ from "underscore";
import {
  AppSettings,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { getDisplayLabel } from "../../../../function/FunctionDraw";
import { isElementHidden } from "../../../../function/FunctionElem";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import { getOtherConnectionElementID } from "../../../../function/FunctionLink";
import { ReactComponent as HiddenElementSVG } from "../../../../svg/hiddenElement.svg";
import Connection from "./Connection";

interface Props {
  linkID: string;
  elemID: string;
  projectLanguage: string;
  selected: boolean;
  selection: string[];
  updateSelection: (ids: string[]) => void;
  infoFunction: (link: string) => void;
  performTransaction: (...queries: string[]) => void;
  update: Function;
}

export default class ConnectionWorkspace extends React.Component<Props> {
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
        link={this.props.linkID}
        selectedLanguage={this.props.projectLanguage}
        direction={this.getConnectionDirection(elemID)}
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
            getVocabularyFromScheme(WorkspaceTerms[elemID].inScheme)
          ].color
        }
        infoFunction={(link: string) => this.props.infoFunction(link)}
        performTransaction={this.props.performTransaction}
        readOnly={
          WorkspaceVocabularies[
            getVocabularyFromScheme(WorkspaceTerms[this.props.elemID].inScheme)
          ].readOnly
        }
        update={() => this.props.update()}
        title={getLabelOrBlank(
          getLinkOrVocabElem(WorkspaceLinks[this.props.linkID].iri).labels,
          this.props.projectLanguage
        )}
        sourceCardinality={WorkspaceLinks[this.props.linkID][
          this.getConnectionDirection(elemID)
            ? "targetCardinality"
            : "sourceCardinality"
        ].getString()}
        targetCardinality={WorkspaceLinks[this.props.linkID][
          this.getConnectionDirection(elemID)
            ? "sourceCardinality"
            : "targetCardinality"
        ].getString()}
      />
    );
  }
}
