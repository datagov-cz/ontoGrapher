import React from 'react';
import DetailLink from "./detail/DetailLink";
import {graph} from "../graph/Graph";
import DetailElement from "./detail/DetailElement";
import {highlightCell, setDisplayLabel, unHighlightCell} from "../function/FunctionDraw";
import {ProjectElements, ProjectLinks} from "../config/Variables";
import {resizeElem} from "../function/FunctionElem";

interface Props {
    projectLanguage: string;
    update: Function;
    handleWidth: Function;
    performTransaction: (...queries: string[]) => void;
    error: boolean;
    id: string;
    updateDetailPanel: Function;
}

interface State {
    hidden: boolean;
    type: string;
}

export default class DetailPanel extends React.Component<Props, State> {

    private readonly detailElem: React.RefObject<DetailElement>;
    private readonly detailLink: React.RefObject<DetailLink>;

    constructor(props: Props) {
        super(props);
        this.state = {
            hidden: true,
            type: "",
        };
        this.detailElem = React.createRef();
        this.detailLink = React.createRef();
        this.hide = this.hide.bind(this);
        this.save = this.save.bind(this);
    }

    hide() {
        if (this.props.id) unHighlightCell(this.props.id);
        this.setState({hidden: true});
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevProps.id !== this.props.id) {
            this.prepareDetails(this.props.id);
        }
    }

    prepareDetails(id: string) {
        if (graph.getCell(id)) highlightCell(this.props.id);
        if (id in ProjectElements) {
            setDisplayLabel(id, this.props.projectLanguage);
            this.setState({
                type: "elem",
                hidden: false
            }, () => {
                this.detailElem.current?.prepareDetails(id);
            });
        } else if (id in ProjectLinks) {
            this.setState({
                type: "link",
                hidden: false
            }, () => {
                this.detailLink.current?.prepareDetails(id);
            });
        }
    }

    save() {
        let cell = graph.getCell(this.props.id);
        if (cell && cell.isElement())
            resizeElem(this.props.id);
        this.props.update();
    }

    update() {
        this.detailElem.current?.forceUpdate();
        this.detailLink.current?.forceUpdate();
        if (this.props.id) {
            this.prepareDetails(this.props.id);
        }
    }

    retry() {
        this.detailElem.current?.save();
    }

    render() {
        if (!this.state.hidden) {
            if (this.state.type === "elem") {
                return (<DetailElement projectLanguage={this.props.projectLanguage}
                                       save={this.save} ref={this.detailElem}
                                       handleWidth={this.props.handleWidth}
                                       performTransaction={this.props.performTransaction}
                                       error={this.props.error}
                                       id={this.props.id}
                                       updateDetailPanel={this.props.updateDetailPanel}
                />);
            } else if (this.state.type === "link") {
                return (<DetailLink
                    error={this.props.error}
                    handleWidth={this.props.handleWidth}
                    projectLanguage={this.props.projectLanguage}
                    performTransaction={this.props.performTransaction}
                    save={this.save} ref={this.detailLink}
                    id={this.props.id}
                    updateDetailPanel={this.props.updateDetailPanel}
                />);
            }
        } else {
            return (<div/>);
        }

    }

}