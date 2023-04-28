import React from "react";
import { LinkControls } from "./components/LinkControls";
import { WorkspaceLinks } from "../../config/Variables";

interface Props {
  projectLanguage: string;
  save: (id: string) => void;
  performTransaction: (...queries: string[]) => void;
  id: string;
}

export default class DetailLink extends React.Component<Props> {
  render() {
    return (
      <div className="detailElement">
        <div className={"accordions"}>
          {this.props.id in WorkspaceLinks && (
            <LinkControls
              id={this.props.id}
              projectLanguage={this.props.projectLanguage}
              save={this.props.save}
              performTransaction={this.props.performTransaction}
            />
          )}
        </div>
      </div>
    );
  }
}
