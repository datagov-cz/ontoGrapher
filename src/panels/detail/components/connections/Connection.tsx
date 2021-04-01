import React from 'react';
import classNames from "classnames";
import {ReactComponent as HiddenElementSVG} from "../../../../svg/hiddenElement.svg";
import {
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes,
    VocabularyElements
} from "../../../../config/Variables";
import {getDisplayLabel} from "../../../../function/FunctionDraw";
import _ from 'underscore';
import {getOtherConnectionElementID} from "../../../../function/FunctionLink";
import {isElementHidden} from "../../../../function/FunctionElem";
import {getLabelOrBlank, getLinkOrVocabElem} from "../../../../function/FunctionGetVars";

interface Props {
    linkID: string;
    elemID: string;
    projectLanguage: string;
    selected: boolean;
    selection: string[];
    updateSelection: (ids: string[]) => void;
}

interface State {

}

export default class Connection extends React.Component<Props, State> {

    getConnectionDirection(id: string): boolean {
        return ProjectLinks[this.props.linkID].source === id;
    }

    render() {
        const elemID = getOtherConnectionElementID(this.props.linkID, this.props.elemID);
        return (<tr draggable
                    onDragStart={(event) => {
                        event.dataTransfer.setData("newClass", JSON.stringify({
                            type: "existing",
                            id: _.uniq(this.props.selection.map(link =>
                                getOtherConnectionElementID(link, this.props.elemID)).concat(elemID))
                        }));
                        this.props.updateSelection(_.uniq(this.props.selection.concat(this.props.linkID)));
                    }}
                    className={classNames('connectionComponent', 'connection', {selected: this.props.selected})}
                    onClick={() => this.props.updateSelection([this.props.linkID])}>
            <td className={'link'}>
                <span className={'text'}>
                    {getLabelOrBlank(getLinkOrVocabElem(ProjectLinks[this.props.linkID].iri).labels, this.props.projectLanguage)}
                </span>
                <svg width="100%" height="25px" preserveAspectRatio="none">
                    <defs>
                        <marker id={this.props.linkID} viewBox="0 0 10 10"
                                refX="10" refY="5"
                                markerUnits="strokeWidth"
                                markerWidth="8" markerHeight="10"
                                orient={this.getConnectionDirection(elemID) ? "180" : "0"}>
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#333333"/>
                        </marker>
                    </defs>
                    <line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="2" stroke="#333333"
                          {...(this.getConnectionDirection(elemID) ?
                              {'markerStart': `url(#${this.props.linkID})`} :
                              {'markerEnd': `url(#${this.props.linkID})`})}/>
                </svg>
            </td>
            <td className={'element'} style={{
                backgroundColor: Schemes[VocabularyElements[ProjectElements[elemID].iri].inScheme].color
            }}>
                {getDisplayLabel(elemID, this.props.projectLanguage)}
                {isElementHidden(elemID, ProjectSettings.selectedDiagram) &&
                <span className={'hidden'}>&nbsp;<HiddenElementSVG/></span>}
            </td>
        </tr>);
    }
}
