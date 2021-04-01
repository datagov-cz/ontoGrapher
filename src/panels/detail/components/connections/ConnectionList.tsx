import React from 'react';
import ConnectionFilter from "./ConnectionFilter";
import Connection from "./Connection";
import {Links, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../../../../config/Variables";
import {Representation} from "../../../../config/Enum";
import {getLabelOrBlank} from "../../../../function/FunctionGetVars";
import TableList from "../../../../components/TableList";
import {getOtherConnectionElementID} from "../../../../function/FunctionLink";
import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {spreadConnections} from "../../../../function/FunctionGraph";
import classNames from "classnames";
import _ from 'underscore';
import {isElementHidden} from "../../../../function/FunctionElem";
import {ElementFilter} from "../../../../datatypes/ElementFilter";
import {Locale} from "../../../../config/Locale";

interface Props {
    //Element ID from DetailElement
    id: string;
    projectLanguage: string;
}

interface State {
    filter: ElementFilter;
    selected: string[];
    shownConnections: string[];
    showFilter: boolean;
}

export default class ConnectionList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            filter: {
                hidden: "",
                ontoType: "",
                typeType: "",
                search: "",
                direction: "",
                connection: "",
                scheme: "",
            },
            selected: [],
            shownConnections: [],
            showFilter: false
        }
        this.updateFilter = this.updateFilter.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
    }

    search(id: string): boolean {
        const search = this.state.filter.search.normalize().trim().toLowerCase();
        const name = getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage);
        return name.normalize().trim().toLowerCase().includes(search) ||
            VocabularyElements[ProjectElements[id].iri].altLabels
                .find(alt => alt.language === this.props.projectLanguage && alt.label.normalize().trim().toLowerCase().includes(search)) !== undefined;
    }

    sort(a: string, b: string): number {
        const aLabel = VocabularyElements[ProjectElements[getOtherConnectionElementID(a, this.props.id)].iri].labels[this.props.projectLanguage];
        const bLabel = VocabularyElements[ProjectElements[getOtherConnectionElementID(b, this.props.id)].iri].labels[this.props.projectLanguage];
        return aLabel.localeCompare(bLabel);
    }

    filter(): string[] {
        return Object.keys(ProjectLinks).filter(link => {
            const otherElement = getOtherConnectionElementID(link, this.props.id);
            if (!(ProjectLinks[link].active)) return false;
            if (this.props.id !== ProjectLinks[link].source && this.props.id !== ProjectLinks[link].target) return false;
            if (this.state.filter.scheme && VocabularyElements[ProjectElements[otherElement].iri].inScheme !== this.state.filter.scheme) return false;
            if (this.state.filter.direction && ProjectLinks[link][this.state.filter.direction] !== this.props.id) return false;
            if (this.state.filter.connection && ProjectLinks[link].iri !== this.state.filter.connection) return false;
            if (this.state.filter.hidden && !(isElementHidden(otherElement, ProjectSettings.selectedDiagram))) return false;
            if (this.state.filter.ontoType && !(VocabularyElements[ProjectElements[otherElement].iri].types.includes(this.state.filter.ontoType))) return false;
            if (this.state.filter.typeType && !(VocabularyElements[ProjectElements[otherElement].iri].types.includes(this.state.filter.typeType))) return false;
            if (this.state.filter.search && !(this.search(otherElement))) return false;
            return ProjectSettings.representation === Representation.FULL ? ProjectLinks[link].iri in Links : (!(ProjectLinks[link].iri in Links) ||
                (ProjectLinks[link].iri in Links && Links[ProjectLinks[link].iri].inScheme.startsWith(ProjectSettings.ontographerContext)))
        }).sort(((a, b) => this.sort(a, b)));
    }

    updateFilter(key: keyof ElementFilter, value: string) {
        this.setState(prevState => ({
            filter: {
                ...prevState.filter,
                [key]: value
            },
        }), () => this.setState({shownConnections: this.filter()}))
    }

    componentDidMount() {
        this.setState({shownConnections: this.filter()});
    }

    updateSelection(ids: string[], remove?: boolean) {
        const iter = this.state.selected;
        if (remove || ids.every(id => iter.includes(id)))
            ids.forEach(id => {
                const idx = iter.indexOf(id);
                if (idx !== -1) iter.splice(idx, 1)
            });
        else if (ids.every(id => !(iter.includes(id))))
            iter.push(...ids);
        this.setState({selected: iter});
    }

    getElements(): string[] {
        return this.state.selected.map(link => getOtherConnectionElementID(link, this.props.id));
    }

    render() {
        return (<div className={'connectionList'}>
            <div className={classNames('buttons')}>
                <OverlayTrigger placement="top" overlay={
                    <Tooltip id="tooltipA">{Locale[ProjectSettings.viewLanguage].connectionListAddSelection}</Tooltip>
                }>
                    <Button className={classNames("buttonlink", {"selected": this.state.selected.length > 0})}
                            onClick={() => {
                                spreadConnections(this.props.id, this.getElements());
                                this.setState({selected: []});
                            }}>{"➕" + (this.state.selected.length > 0 ? ` ${this.state.selected.length}` : "")}</Button>
                </OverlayTrigger>

                <OverlayTrigger placement="top" overlay={
                    <Tooltip id="tooltipB">{Locale[ProjectSettings.viewLanguage].connectionListEmptySelection}</Tooltip>
                }>
                    <Button className={"buttonlink"} onClick={() => this.setState({selected: []})}>{"🚮"}</Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={
                    <Tooltip id="tooltipC">{Locale[ProjectSettings.viewLanguage].connectionListShowSelection}</Tooltip>
                }>
                    <Button className={"buttonlink"}
                            onClick={() => this.setState(prevState => ({selected: _.uniq(prevState.selected.concat(this.state.shownConnections))}))}>{"✅"}</Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={
                    <Tooltip id="tooltipD">{Locale[ProjectSettings.viewLanguage].connectionListShowFilter}</Tooltip>
                }>
                    <Button className={"buttonlink"}
                            onClick={() => this.setState({showFilter: !this.state.showFilter})}>{"🔍"}</Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={
                    <Tooltip id="tooltipE">{Locale[ProjectSettings.viewLanguage].connectionListEmptyFilter}</Tooltip>
                }>
                    <Button className={"buttonlink"} onClick={() => this.setState({
                        filter: {
                            hidden: "",
                            ontoType: "",
                            typeType: "",
                            search: "",
                            direction: "",
                            connection: "",
                            scheme: ""
                        }
                    }, () => this.setState({shownConnections: this.filter()}))}>{"❌"}</Button>
                </OverlayTrigger>
            </div>
            {this.state.showFilter && <ConnectionFilter projectLanguage={this.props.projectLanguage}
                                                        updateFilter={this.updateFilter}
                                                        filter={this.state.filter}
                                                        showFilter={this.state.showFilter}/>}
            <TableList>
                {this.state.shownConnections.map(linkID => <Connection key={linkID}
                                                                       selected={this.state.selected.includes(linkID)}
                                                                       linkID={linkID}
                                                                       elemID={this.props.id}
                                                                       projectLanguage={this.props.projectLanguage}
                                                                       updateSelection={this.updateSelection}
                                                                       selection={this.state.selected}/>)}
            </TableList>
        </div>);
    }
}