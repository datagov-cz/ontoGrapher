import React from 'react';
import TableList from "../../../components/TableList";
// @ts-ignore
import {RIEInput} from "riek";
import {getLabelOrBlank} from "../../../function/FunctionGetVars";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";

interface Props {
    labels: { [key: string]: string };
    readOnly: boolean;
    onEdit?: Function;
}

export default class LabelTable extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (<TableList>
            {Object.keys(this.props.labels).map(lang =>
                <tr>
                    {this.props.readOnly && this.props.onEdit ?
                        <span>
                            <RIEInput
                                className={"rieinput"}
                                value={getLabelOrBlank(this.props, lang)}
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
                        </span>
                        :
                        <td>
                            {getLabelOrBlank(this.props, lang)}
                        </td>
                    }
                    <td>Languages[lang]</td>
                </tr>
            )}
        </TableList>);
    }
}