import React from 'react';
import {ResizableBox} from "react-resizable";
import TableList from "../components/TableList";
import * as LocaleMain from "../locale/LocaleMain.json";
import {Button, Spinner} from 'react-bootstrap';
import {validateWorkspace} from "../interface/ValidationInterface";
import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {graph} from "../graph/Graph";
import IRIlabel from "../components/IRIlabel";

interface Props {
	widthLeft: number;
	widthRight: number;
	close: Function;
	projectLanguage: string;
}

interface State {
	results: { severity: string, message: string, focusNode: string }[];
	width: number;
	conforms: boolean;
	loading: boolean;
	error: boolean;
}

export default class ValidationPanel extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			results: [],
			width: this.getWidth(),
			conforms: false,
			loading: false,
			error: false,
		}
		this.getWidth = this.getWidth.bind(this);
		this.validate = this.validate.bind(this);
	}

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
		if (prevProps !== this.props) this.setState({width: this.getWidth()});
	}

	getWidth() {
		let width = window.innerWidth;
		width -= this.props.widthLeft;
		width -= this.props.widthRight;
		let elem = document.querySelector(".validation") as HTMLElement;
		if (elem) elem.style.left = this.props.widthLeft + "px";
		return width;
	}

	async validate() {
		this.setState({loading: true, error: false});
		let results = await validateWorkspace(ProjectSettings.contextIRI, ProjectSettings.selectedLanguage).catch(() => {
			return false;
		});
		if (results) {
			this.setState({
				conforms: results.conforms,
				results: results.results
			})
			this.highlight();
		} else {
			this.setState({error: true});
		}
		this.setState({loading: false});
	}

	focus(node: string) {
		let cellElem = graph.getElements().find(element => ProjectElements[element.id].iri === node);
		let cellLink = graph.getLinks().find(element => ProjectLinks[element.id].iri === node);
		if (cellElem) cellElem.attr({body: {stroke: '#FFFF00'}});
		if (cellLink) cellLink.attr({line: {stroke: '#FFFF00'}});
	}

	highlight() {
		let iriList = this.state.results.map(result => result.focusNode);
		graph.getCells().forEach(cell => {
			if (cell.id in ProjectElements && iriList.includes(ProjectElements[cell.id].iri)) {
				cell.attr({body: {stroke: '#FF0000'}});
			} else if (cell.id in ProjectLinks && iriList.includes(ProjectLinks[cell.id].iri)) {
				cell.attr({line: {stroke: '#FF0000'}});
			}
		})
	}

	render() {
		return (<ResizableBox className={"validation"}
							  width={this.state.width}
							  height={200}
							  axis={"y"}
							  handleSize={[8, 8]}
							  resizeHandles={['ne']}
		>
			<div className={"top"}>
				<h4>{LocaleMain.validation}</h4>
				<span className="right">
				<Button onClick={() => {
					this.validate()
				}}>{LocaleMain.validationReload}</Button>
				<Button variant={"secondary"} onClick={() => this.props.close()}>{LocaleMain.close}</Button>
					</span>
			</div>
			{this.state.conforms && <div className={"centeredValidation"}>{"✅" + LocaleMain.conforms}</div>}
			{this.state.error && <div className={"centeredValidation"}>{LocaleMain.validationLoadingError}</div>}
			{this.state.loading && <div className={"centered"}><Spinner animation={"border"}/></div>}
			{(!this.state.loading && !this.state.conforms && !this.state.error) &&
            <div style={{overflow: "auto", height: "inherit"}}><TableList
                headings={[LocaleMain.validationNumber, LocaleMain.validationSeverity, LocaleMain.validationName, LocaleMain.validationError]}>
				{this.state.results.map((result, i) => <tr>
					<td>
						<button className={"buttonlink"} onClick={() => this.focus(result.focusNode)}>{i + 1}</button>
					</td>
					<td>{result.severity.substring(result.severity.lastIndexOf("#") + 1)}</td>
					{result.focusNode in VocabularyElements ?
						<IRIlabel label={VocabularyElements[result.focusNode].labels[this.props.projectLanguage]}
								  iri={result.focusNode}/>
						: <IRIlabel label={result.focusNode} iri={result.focusNode}/>}
					<td>{result.message.includes("@") ? result.message.substring(0, result.message.lastIndexOf("@")) : result.message}</td>
				</tr>)}
            </TableList></div>}
		</ResizableBox>);
	}
}