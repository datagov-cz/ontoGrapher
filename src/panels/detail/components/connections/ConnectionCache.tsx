import React from "react";
import { AppSettings, WorkspaceLinks } from "../../../../config/Variables";
import { getLabelOrBlank } from "../../../../function/FunctionGetVars";
import { getVocabularyShortLabel } from "@opendata-mvcr/assembly-line-shared";
import { Badge, OverlayTrigger, Popover } from "react-bootstrap";
import { CacheSearchVocabularies } from "../../../../datatypes/CacheSearchResults";
import _ from "underscore";
import { getOtherConnectionElementID } from "../../../../function/FunctionLink";
import { Representation } from "../../../../config/Enum";
import Connection from "./Connection";

interface Props {
  connection: {
    link: string;
    linkLabels: { [key: string]: string };
    target: {
      iri: string;
      labels: { [key: string]: string };
      description: { [key: string]: string };
      vocabulary: string;
    };
    direction: string;
  };
  projectLanguage: string;
  update: Function;
  elemID: string;
  selected: boolean;
  selection: string[];
  updateSelection: (ids: string[]) => void;
}

interface State {}

export default class ConnectionCache extends React.Component<Props, State> {
  checkVocabulary(vocabulary: string) {
    return vocabulary in CacheSearchVocabularies
      ? getLabelOrBlank(
          CacheSearchVocabularies[vocabulary].labels,
          this.props.projectLanguage
        )
      : "";
  }

  render() {
    return (
      <OverlayTrigger
        placement={"left"}
        overlay={
          <Popover id={"termDetailPopover"}>
            <Popover.Title as="h3">
              {getLabelOrBlank(
                this.props.connection.target.labels,
                this.props.projectLanguage
              )}
              &nbsp;
              <Badge className={"wrap"} variant={"secondary"}>
                {this.checkVocabulary(this.props.connection.target.vocabulary)}
              </Badge>
            </Popover.Title>
            <Popover.Content>
              {
                this.props.connection.target.description[
                  this.props.projectLanguage
                ]
              }
            </Popover.Content>
          </Popover>
        }
      >
        <Connection
          onDragStart={(event: DragEvent) => {
            const add =
              AppSettings.representation === Representation.FULL
                ? [this.props.connection.target.iri]
                : [
                    this.props.connection.target.iri,
                    this.props.connection.link,
                  ];
            event?.dataTransfer?.setData(
              "newClass",
              JSON.stringify({
                id: _.uniq(
                  this.props.selection
                    .filter((link) => link in WorkspaceLinks)
                    .map((link) =>
                      getOtherConnectionElementID(link, this.props.elemID)
                    )
                ),
                iri: _.uniq(
                  this.props.selection
                    .filter((link) => !(link in WorkspaceLinks))
                    .concat(...add)
                ),
              })
            );
          }}
          onDragEnd={() => this.props.update()}
          onClick={() =>
            this.props.updateSelection(
              AppSettings.representation === Representation.FULL
                ? [this.props.connection.target.iri]
                : [this.props.connection.target.iri, this.props.connection.link]
            )
          }
          selected={this.props.selected}
          linkLabel={getLabelOrBlank(
            this.props.connection.linkLabels,
            this.props.projectLanguage
          )}
          direction={this.props.connection.direction === "target"}
          markerID={
            this.props.connection.link + "/" + this.props.connection.target.iri
          }
          backgroundColor={"white"}
          elementLabel={
            <span>
              {getLabelOrBlank(
                this.props.connection.target.labels,
                this.props.projectLanguage
              )}
              &nbsp;
              <Badge variant={"secondary"}>
                {getVocabularyShortLabel(
                  this.props.connection.target.vocabulary
                )}
              </Badge>
            </span>
          }
        />
      </OverlayTrigger>
    );
  }
}
