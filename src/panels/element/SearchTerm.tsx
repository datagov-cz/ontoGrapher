import React from "react";
import { Badge, OverlayTrigger, Popover } from "react-bootstrap";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { AppSettings, WorkspaceTerms } from "../../config/Variables";
import { getVocabularyShortLabel } from "@opendata-mvcr/assembly-line-shared";
import {
  CacheSearchResults,
  CacheSearchVocabularies,
} from "../../datatypes/CacheSearchResults";
import { CanvasTerm } from "../../config/Enum";
import classNames from "classnames";

interface Props {
  projectLanguage: string;
  iri: string;
  result: CacheSearchResults[keyof CacheSearchResults];
  list?: boolean;
  update: () => void;
}

interface State {}

export class SearchTerm extends React.Component<Props, State> {
  handleClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (AppSettings.selectedLucene.includes(this.props.iri)) {
        const index = AppSettings.selectedLucene.indexOf(this.props.iri);
        if (index !== -1) AppSettings.selectedLucene.splice(index, 1);
      } else AppSettings.selectedLucene.push(this.props.iri);
    } else AppSettings.selectedLucene = [];
    this.props.update();
  }

  checkVocabulary(vocabulary: string) {
    return vocabulary in CacheSearchVocabularies ? getLabelOrBlank(
      CacheSearchVocabularies[vocabulary].labels,
      this.props.projectLanguage
    ) : "";
  }

  render() {
    return (
      <OverlayTrigger
        placement={"right"}
        overlay={
          <Popover id={"termDetailPopover"}>
            <Popover.Title as="h3">
              {getLabelOrBlank(
                this.props.result.labels,
                this.props.projectLanguage
              )}
              &nbsp;
              <Badge className={"wrap"} variant={"secondary"}>
                {this.checkVocabulary(this.props.result.vocabulary)}
              </Badge>
            </Popover.Title>
            <Popover.Content>
              {this.props.result.definitions[this.props.projectLanguage]}
            </Popover.Content>
          </Popover>
        }
      >
        <div
          draggable
          className={classNames("stereotypeElementItem", {
            selected: AppSettings.selectedLucene.includes(this.props.iri),
          })}
          onDragStart={(event) => {
            event.dataTransfer.setData(
              "newClass",
              JSON.stringify({
                type: CanvasTerm.NEW,
                id: [],
                iri:
                  AppSettings.selectedLucene.length > 0
                    ? AppSettings.selectedLucene
                    : [this.props.iri],
              })
            );
          }}
          onDragEnd={() => {
            AppSettings.selectedLucene = [];
            this.props.update();
          }}
          onClick={(event) => this.handleClick(event)}
        >
          {getLabelOrBlank(
            this.props.result.labels,
            this.props.projectLanguage
          )}
          &nbsp;
          {this.props.list && (
            <Badge variant={"secondary"}>
              {getVocabularyShortLabel(this.props.result.vocabulary)}
            </Badge>
          )}
          &nbsp;
          {this.props.iri in WorkspaceTerms && "⭐"}
        </div>
      </OverlayTrigger>
    );
  }
}
