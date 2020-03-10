import React from 'react';
import {Diagrams, graph, ProjectSettings} from "../../var/Variables";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

interface Props{
    linkType: string;
}

interface State {
}

export default class PanelDiagramItem extends React.Component<Props, State> {
    private name: string;
    constructor(props: Props) {
        super(props);
        this.name = this.props.linkType === ProjectSettings.selectedModel ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram";
        this.alertPanel = this.alertPanel.bind(this);
        this.setClassName();
    }

    alertPanel() {
        Diagrams[ProjectSettings.selectedModel].save = graph.toJSON();
        let load = Diagrams[this.props.linkType].save;
        if (load !== ""){
            graph.fromJSON(load);
        } else {
            graph.clear();
        }
        ProjectSettings.selectedModel = this.props.linkType;
        this.setClassName();
        this.forceUpdate();
    }

    // componentDidUpdate(prevProps: { selectedLink: any; }) {
    //     if (prevProps.selectedLink !== ProjectSettings.selectedModel) {
    //         this.setClassName();
    //         this.forceUpdate();
    //     }
    // }

    setClassName() {
        this.name = this.props.linkType === ProjectSettings.selectedModel ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram";
    }

    render() {
        return (
            <div>
                    <div className={this.name}
                         onClick={this.alertPanel}
                    >
                        <span className={"label"}>{Diagrams[this.props.linkType].name}</span>
                    </div>
            </div>
        );
    }
}