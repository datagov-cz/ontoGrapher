import React from 'react';
import TableList from "../../../components/TableList";
// @ts-ignore
import {getLabelOrBlank} from "../../../function/FunctionGetVars";
import {Languages, ProjectSettings} from "../../../config/Variables";
import IRIlabel from "../../../components/IRIlabel";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {Locale} from "../../../config/Locale";

interface Props {
    labels: { [key: string]: string };
    iri?: string;
    default?: string;
    selectAsDefault?: Function;
}

export default class LabelTable extends React.Component<Props> {

    render() {
        return (<TableList>
            {Object.keys(this.props.labels).map((lang, i) =>
                <tr key={i}>
                    {this.props.iri ?
                        <IRIlabel label={getLabelOrBlank(this.props.labels, lang)} iri={this.props.iri}/> :
                        <td className={"stretch"}>
                            {getLabelOrBlank(this.props.labels, lang)}
                            {(getLabelOrBlank(this.props.labels, lang) !== this.props.default &&
                                (getLabelOrBlank(this.props.labels, lang) !== "<blank>")) &&
                            <span className={"right"}><OverlayTrigger
                                placement="left"
                                delay={{show: 250, hide: 400}}
                                overlay={<Tooltip id="button-tooltip">
                                    {Locale[ProjectSettings.viewLanguage].setAsDisplayName}
                                </Tooltip>}>
                                <button className={"buttonlink"}
                                        onClick={() => {
                                            if (this.props.selectAsDefault)
                                                this.props.selectAsDefault(getLabelOrBlank(this.props.labels, lang));
                                        }}><span role="img"
                                                 aria-label={""}>🏷️</span>
                            </button></OverlayTrigger></span>}
                        </td>}
                    <td className={"short"}>{Languages[lang]}</td>
                </tr>
            )}
        </TableList>);
    }
}