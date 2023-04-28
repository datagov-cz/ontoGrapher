import classNames from "classnames";
import React from "react";
import { LinkControls } from "../LinkControls";
import { WorkspaceLinks } from "../../../../config/Variables";

interface Props {
  projectLanguage: string;
  id: string;
  performTransaction: (...queries: string[]) => void;
  visible: boolean;
  close: Function;
  save: (id: string) => void;
}

export default class ConnectionOverlay extends React.Component<Props> {
  render() {
    return (
      <div className={classNames("overlay", { visible: this.props.visible })}>
        {this.props.id in WorkspaceLinks && (
          <LinkControls
            id={this.props.id}
            projectLanguage={this.props.projectLanguage}
            save={this.props.save}
            performTransaction={this.props.performTransaction}
          />
        )}
      </div>
    );
  }
}
