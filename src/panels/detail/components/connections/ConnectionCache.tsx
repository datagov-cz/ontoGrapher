import React from "react";
import { Badge, OverlayTrigger, Popover } from "react-bootstrap";
import _ from "underscore";
import { Representation } from "../../../../config/Enum";
import { AppSettings, WorkspaceLinks } from "../../../../config/Variables";
import { CacheSearchVocabularies } from "../../../../datatypes/CacheSearchResults";
import {
  getLabelOrBlank,
  getVocabularyLabel,
} from "../../../../function/FunctionGetVars";
import { getOtherConnectionElementID } from "../../../../function/FunctionLink";
import { CacheConnection } from "../../../../types/CacheConnection";
import Connection from "./Connection";

interface Props {
  connection: CacheConnection;
  projectLanguage: string;
  update?: Function;
  elemID: string;
  selected: boolean;
  selection: string[];
  updateSelection?: (ids: string[]) => void;
  performTransaction: (...queries: string[]) => void;
}

export default class ConnectionCache extends React.Component<Props> {
  getVocabularyLabel(vocabulary: string): string {
    return vocabulary in CacheSearchVocabularies
      ? getLabelOrBlank(
          CacheSearchVocabularies[vocabulary].labels,
          this.props.projectLanguage
        )
      : "";
  }

  transferConnectionToEvent(event: DragEvent) {
    const add =
      AppSettings.representation === Representation.FULL
        ? [this.props.connection.target.iri]
        : [this.props.connection.target.iri, this.props.connection.link];
    event?.dataTransfer?.setData(
      "newClass",
      JSON.stringify({
        id: _.uniq(
          this.props.selection
            .filter((link) => link in WorkspaceLinks)
            .map((link) => getOtherConnectionElementID(link, this.props.elemID))
        ),
        iri: _.uniq(
          this.props.selection
            .filter((link) => !(link in WorkspaceLinks))
            .concat(...add)
        ),
      })
    );
  }

  prepareUpdateSelection() {
    if (!this.props.updateSelection) return;
    let ids: string[] = [];
    switch (AppSettings.representation) {
      case Representation.FULL:
        ids = [this.props.connection.target.iri];
        break;
      case Representation.COMPACT:
        ids = [this.props.connection.target.iri, this.props.connection.link];
        break;
      default:
        throw new Error(
          `Unknown view representation number ${AppSettings.representation}.`
        );
    }
    this.props.updateSelection(ids);
  }

  render() {
    return (
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement={"left"}
        overlay={
          <Popover id={"termDetailPopover"}>
            <Popover.Header as="h3">
              {getLabelOrBlank(
                this.props.connection.target.labels,
                this.props.projectLanguage
              )}
              &nbsp;
              <Badge className={"wrap"} bg={"secondary"}>
                {this.getVocabularyLabel(
                  this.props.connection.target.vocabulary
                )}
              </Badge>
            </Popover.Header>
            <Popover.Body>
              {
                this.props.connection.target.definitions[
                  this.props.projectLanguage
                ]
              }
            </Popover.Body>
          </Popover>
        }
      >
        <Connection
          onDragStart={(event: DragEvent) => {
            if (this.props.update) this.transferConnectionToEvent(event);
          }}
          onDragEnd={() => {
            if (this.props.update) this.props.update();
          }}
          onClick={() => this.prepareUpdateSelection()}
          selected={this.props.selected}
          link={this.props.connection.link}
          direction={this.props.connection.direction === "target"}
          selectedLanguage={this.props.projectLanguage}
          backgroundColor={"white"}
          performTransaction={this.props.performTransaction}
          elementLabel={
            <span>
              {getLabelOrBlank(
                this.props.connection.target.labels,
                this.props.projectLanguage
              )}
              &nbsp;
              <Badge bg={"secondary"}>
                {getVocabularyLabel(this.props.connection.target.vocabulary)}
              </Badge>
            </span>
          }
          readOnly={true}
        />
      </OverlayTrigger>
    );
  }
}
