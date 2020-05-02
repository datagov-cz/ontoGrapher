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

    private readonly detailElem: React.RefObject<DetailElem>;
    private readonly linkElem: React.RefObject<DetailLink>;

    constructor(props: Props) {
        super(props);
        this.state = {
            id: undefined,
            hidden: true,
            type: "",
        };
        this.detailElem = React.createRef();
        this.linkElem = React.createRef();
        this.hide = this.hide.bind(this);
        this.save = this.save.bind(this);
    }

    hide() {
        this.setState({hidden: true});
    }

    prepareDetails(id: string) {
        if (graph.getCell(id).isElement()) {
            this.setState({
                id: id,
                type: "elem",
                hidden: false
            });
            this.detailElem.current?.prepareDetails(id);
        } else if (graph.getCell(id).isLink()) {
            this.setState({
                id: id,
                type: "link",
                hidden: false
            });
            this.linkElem.current?.prepareDetails(id);
        }
    }

    save() {
        if (graph.getCell(this.state.id).isElement()) this.props.resizeElem(this.state.id);
        this.props.update();
    }

    render() {
        if (!this.state.hidden) {
            if (this.state.type === "elem") {
                return (<DetailElem headers={headers} projectLanguage={this.props.projectLanguage}
                                    save={this.save} ref={this.detailElem}/>);
            } else if (this.state.type === "link") {
                return (<DetailLink projectLanguage={this.props.projectLanguage} headers={headers}
                                    save={this.save} ref={this.linkElem}/>);
            }
        } else {
            return (<div/>);
        }

    }

}