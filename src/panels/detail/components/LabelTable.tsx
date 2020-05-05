import React from 'react';
import TableList from "../../../components/TableList";
// @ts-ignore
import {RIEInput} from "riek";
import {getLabelOrBlank} from "../../../function/FunctionGetVars";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import {Languages} from "../../../config/Variables";

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
                    {(!this.props.readOnly) && this.props.onEdit ?
                        <td>
                            <RIEInput
                                className={"rieinput"}
                                value={getLabelOrBlank(this.props.labels, lang)}
                                change={(event: { textarea: string }) => {
                                    if (this.props.onEdit) this.props.onEdit(event.textarea, lang);
                                }}
                                propName="textarea"
                            />
                            &nbsp;
                            <button className={"buttonlink"}
                                    onClick={() => {
                                        if (this.props.onEdit) this.props.onEdit("", lang);
                                    }}>
                                {LocaleMenu.deleteProjectName}</button>
                        </td>
                        :
                        <td>
                            {getLabelOrBlank(this.props.labels, lang)}
                        </td>
                    }
                    <td>{Languages[lang]}</td>
                </tr>
            )}
        </TableList>);
    }
}