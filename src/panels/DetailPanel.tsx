import React from 'react';
import DetailLink from "./detail/DetailLink";
import {graph} from "../graph/graph";
import DetailElem from "./detail/DetailElem";

const headers: { [key: string]: { [key: string]: string } } = {
    labels: {"cs": "Název", "en": "Label"},
    inScheme: {"cs": "Ze slovníku", "en": "In vocabulary"},
    definition: {"cs": "Definice", "en": "Definition"},
    stereotype: {"cs": "Stereotyp", "en": "Stereotype"}
}

interface Props {
    projectLanguage: string;
    resizeElem: Function;
    update: Function;
}

interface State {
    id: any,
    hidden: boolean;
    type: string;
}

export default class DetailPanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            id: undefined,
            hidden: true,
            type: "",
        };
        this.hide = this.hide.bind(this);
        this.prepareDetails = this.prepareDetails.bind(this);
    }

    hide() {
        this.setState({hidden: true});
    }

    prepareDetails(id: string) {
        if (graph.getCell(id).isElement()) {
            this.setState({
                hidden: false,
                id: id,
                type: "elem"
            });
        } else if (graph.getCell(id).isLink()) {
            this.setState({
                id: id,
                type: "link",
                hidden: false
            });
        }
    }

    save() {
        this.props.resizeElem(this.state.id);
        this.props.update();
    }

    render() {
        if (!this.state.hidden) {
            if (this.state.type === "elem") {
                return (<DetailElem headers={headers} id={this.state.id} projectLanguage={this.props.projectLanguage}
                                    save={this.save}/>);
            } else if (this.state.type === "link") {
                return (<DetailLink projectLanguage={this.props.projectLanguage} headers={headers} id={this.state.id}
                                    save={this.save}/>);
            }
        } else {
            return (<div/>);
        }

    }

}