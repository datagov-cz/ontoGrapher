import React from "react";
import { Badge, OverlayTrigger, Popover } from "react-bootstrap";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
} from "../../config/Variables";
import { getVocabularyShortLabel } from "@opendata-mvcr/assembly-line-shared";
import {
  CacheSearchResults,
  CacheSearchVocabularies,
} from "../../datatypes/CacheSearchResults";
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
      if (AppSettings.selectedElements.includes(this.props.iri)) {
        const index = AppSettings.selectedElements.indexOf(this.props.iri);
        if (index !== -1) AppSettings.selectedElements.splice(index, 1);
      } else AppSettings.selectedElements.push(this.props.iri);
    } else AppSettings.selectedElements = [];
    this.props.update();
  }

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
            selected: AppSettings.selectedElements.includes(this.props.iri),
          })}
          onDragStart={(event) => {
            event.dataTransfer.setData(
              "newClass",
              JSON.stringify({
                id:
                  AppSettings.selectedElements.length > 0
                    ? AppSettings.selectedElements.filter(
                        (elem) => elem in WorkspaceElements
                      )
                    : [],
                iri:
                  AppSettings.selectedElements.length > 0
                    ? AppSettings.selectedElements.filter(
                        (elem) => !(elem in WorkspaceElements)
                      )
                    : [this.props.iri],
              })
            );
          }}
          onDragEnd={() => {
            AppSettings.selectedElements = [];
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
