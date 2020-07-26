import React from 'react';
import TableList from "../../../components/TableList";
// @ts-ignore
import {RIEInput} from "riek";
import {getLabelOrBlank} from "../../../function/FunctionGetVars";
import {Languages} from "../../../config/Variables";
import IRILink from "../../../components/IRILink";

interface Props {
    labels: { [key: string]: string };
    readOnly: boolean;
    iri?: string;
    onEdit?: Function;
}

export default class LabelTable extends React.Component<Props> {

    render() {
        return (<TableList>
            {Object.keys(this.props.labels).map((lang, i) =>
                <tr key={i}>
                    {((!this.props.readOnly) && this.props.onEdit) ?
                        <td>
                            <RIEInput
                                className={"rieinput"}
                                value={getLabelOrBlank(this.props.labels, lang)}
                                change={(event: { textarea: string }) => {
                                    if (this.props.onEdit) this.props.onEdit(event.textarea, lang);
                                }}
                                propName="textarea"
                            />
                            <button className={"buttonlink right"}
                                    onClick={() => {
                                        if (this.props.onEdit) this.props.onEdit("", lang);
                                    }}><span role="img"
                                             aria-label={""}>❌</span></button>
                        </td>
                        :
                        <td>
                            {this.props.iri ? <IRILink label={getLabelOrBlank(this.props.labels, lang)}
                                                       iri={this.props.iri}/> : getLabelOrBlank(this.props.labels, lang)}
                        </td>
                    }
                    <td>{Languages[lang]}</td>
                </tr>
            )}
        </TableList>);
    }
}