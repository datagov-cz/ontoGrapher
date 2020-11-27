import React from 'react';
import TableList from "../../../components/TableList";
// @ts-ignore
import {RIEInput} from "riek";
import {Languages, ProjectSettings} from "../../../config/Variables";
import InlineEdit, {InputType} from "riec";
import {Form, OverlayTrigger, Tooltip} from "react-bootstrap";
import {Locale} from "../../../config/Locale";

interface Props {
	labels: { label: string, language: string }[];
	readOnly: boolean;
	default: string;
	onEdit: Function;
	selectAsDefault: Function;
	addAltLabel: Function;
}

interface State {
	newAltInput: string;
}

export default class AltLabelTable extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			newAltInput: ""
		}
	}

	render() {
		return (<TableList>
			{Object.keys(this.props.labels).map((entry, i) =>
				<tr key={i}>
					<th colSpan={this.props.readOnly ? 2 : 1} className={"stretch"}>
						{this.props.readOnly ?
							this.props.labels[i].label
							: <RIEInput
								className={"rieinput"}
								value={this.props.labels[i].label}
								change={(event: { textarea: string }) => {
									if (this.props.onEdit) this.props.onEdit(event.textarea, this.props.labels[i].language, i);
								}}
								propName="textarea"
							/>}
						<span className={"right"}>
                        {(this.props.labels[i].label !== this.props.default) &&
                        <OverlayTrigger
                            placement="left"
                            delay={{show: 250, hide: 400}}
                            overlay={<Tooltip id="button-tooltip">
								{Locale[ProjectSettings.viewLanguage].setAsDisplayName}
							</Tooltip>}
                        >
                            <button className={"buttonlink"}
                                    onClick={() => {
										if (this.props.onEdit) this.props.selectAsDefault(this.props.labels[i].language, i);
									}}><span role="img"
                                             aria-label={""}>🏷️</span>
                            </button>
                        </OverlayTrigger>}
                        </span>
					</th>
					<td className={"short"}>
						{(this.props.readOnly && this.props.labels[i].language in Languages) ? Languages[this.props.labels[i].language] :
							<InlineEdit
								type={InputType.Select}
								value={this.props.labels[i].language}
								onChange={(language) =>
									this.props.onEdit(this.props.labels[i].label, language, i)
								}
								options={Object.keys(Languages).map(lang => {
									return {id: lang, name: Languages[lang]}
								})}
								valueKey="id"
								labelKey="name"
								viewClass={"rieinput"}
							/>
						}
					</td>
					{(!this.props.readOnly) && <td className={"short"}>
                        <span className={"right"}><button className={"buttonlink"}
                                                          onClick={() => {
															  if (this.props.onEdit) this.props.onEdit("", this.props.labels[i].language, i);
														  }}><span role="img"
                                                                   aria-label={""}>❌</span></button></span></td>}
				</tr>
			)}
			{(!this.props.readOnly) && <tr>
                <th colSpan={2}>
                    <Form onSubmit={(event) => {
						event.preventDefault();
						this.props.addAltLabel(this.state.newAltInput);
						this.setState({newAltInput: ""});
					}}>
                        <Form.Control size={"sm"} id={"newAltLabelInput"} type="text" value={this.state.newAltInput}
                                      placeholder={Locale[ProjectSettings.viewLanguage].addAltLabelPlaceholder}
                                      onChange={(event) =>
										  this.setState({newAltInput: event.currentTarget.value})}/>
                    </Form>
                </th>
                <td className={"short"}>
                    <button className={"buttonlink"}
                            onClick={() => {
								this.props.addAltLabel(this.state.newAltInput);
								this.setState({newAltInput: ""});
							}}><span role="img"
                                     aria-label={""}>➕</span></button>
                </td>
            </tr>}
		</TableList>);
	}
}