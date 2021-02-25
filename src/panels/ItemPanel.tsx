import React from 'react';
import {ResizableBox} from "react-resizable";
import {PackageRoot, ProjectElements, ProjectSettings, Schemes, VocabularyElements} from "../config/Variables";
import PackageFolder from "./element/PackageFolder";
import PackageItem from "./element/PackageItem";
import {getLabelOrBlank} from "../function/FunctionGetVars";
import ModalRemoveItem from "./modal/ModalRemoveItem";
import {Form, InputGroup} from 'react-bootstrap';
import {parsePrefix} from "../function/FunctionEditVars";
import {Representation} from "../config/Enum";
import PackageDivider from "./element/PackageDivider";
import {Locale} from "../config/Locale";
import {graph} from "../graph/Graph";
import {paper} from "../main/DiagramCanvas";
import {
	highlightElement,
	resetDiagramSelection,
	unhighlightElement,
	updateDiagramPosition
} from "../function/FunctionDiagram";
import {Shapes} from "../config/visual/Shapes";

interface Props {
	projectLanguage: string;
	performTransaction: (...queries: string[]) => void;
	handleWidth: Function;
	updateDetailPanel: Function;
	error: boolean;
	update: Function;
}

interface State {
	filter: string[];
	search: string;
	modalRemoveItem: boolean;
	selectedID: string;
}

export default class ItemPanel extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {
			filter: [],
			search: "",
			modalRemoveItem: false,
			selectedID: "",
		};
		this.handleChangeSearch = this.handleChangeSearch.bind(this);
	}

	showItem(id: string) {
		PackageRoot.children.forEach(pkg => {
			if (!(pkg.open))
				pkg.open = pkg.elements.includes(id);
		});
		this.setState({selectedID: id}, () => {
			const itemElement = document.getElementById(this.state.selectedID);
			if (itemElement) {
				itemElement.scrollIntoView({behavior: "smooth", block: "center"});
			}
		});
	}

	update(id?: string) {
		if (id) this.showItem(id);
		this.forceUpdate();
	}

	handleChangeSearch(event: React.ChangeEvent<HTMLSelectElement>) {
		PackageRoot.children.forEach(pkg => pkg.open = !(event.currentTarget.value === ""));
		this.setState({search: event.currentTarget.value});
		this.forceUpdate();
	}

	sort(a: string, b: string): number {
		const aLabel = VocabularyElements[ProjectElements[a].iri].labels[this.props.projectLanguage];
		const bLabel = VocabularyElements[ProjectElements[b].iri].labels[this.props.projectLanguage];
		return aLabel.localeCompare(bLabel);
	}

	categorizeTypes(elements: string[]): { [key: string]: string[] } {
		let result: { [key: string]: string[] } = {'unsorted': []};
		Object.keys(Shapes).forEach(type => result[type] = []);
		for (const elem of elements) {
			const types = VocabularyElements[ProjectElements[elem].iri].types;
			for (const key in Shapes) {
				if (types.includes(key)) {
					result[key].push(elem);
					break;
				}
			}
			if (!Object.values(result).find(arr => arr.includes(elem)))
				result['unsorted'].push(elem);
		}
		return result;
	}

	search(id: string): boolean {
		const search = this.state.search.normalize().trim().toLowerCase();
		const name = getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage);
		return name.normalize().trim().toLowerCase().includes(search) ||
			VocabularyElements[ProjectElements[id].iri].altLabels
				.find(alt => alt.language === this.props.projectLanguage && alt.label.normalize().trim().toLowerCase().includes(search)) !== undefined;
	}

	getFolders(): JSX.Element[] {
		let result: JSX.Element[] = [];
		for (const node of PackageRoot.children) {
			const elements = node.elements.sort((a, b) => this.sort(a, b)).filter(id => {
				return (
					this.search(id) &&
					(ProjectSettings.representation === Representation.FULL ||
						(ProjectSettings.representation === Representation.COMPACT &&
							(!(VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
									|| VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti")))
							))))
			});
			let packageItems: JSX.Element[] = [];
			let categories = this.categorizeTypes(elements);
			for (const key in categories) {
				if (categories[key].length === 0) continue;
				if (ProjectSettings.viewItemPanelTypes) {
					const slice = elements.filter(elem => categories[key].includes(elem))
					packageItems.push(<PackageDivider
						key={Object.keys(Shapes).includes(key) ? key : ""}
						iri={Object.keys(Shapes).includes(key) ? key : ""}
						items={slice}
						visible={node.open}
						projectLanguage={this.props.projectLanguage}
						handleSelect={() => {
							if (slice.every(id => ProjectSettings.selectedElements.includes(id)))
								ProjectSettings.selectedElements
									.filter(elem => (slice.includes(elem)))
									.forEach(elem => unhighlightElement(elem));
							else slice.forEach(elem => highlightElement(elem));
							this.forceUpdate();
						}}
					/>);
				}
				for (const id of categories[key]) {
					packageItems.push(<PackageItem
						key={id}
						id={id}
						visible={node.open}
						projectLanguage={this.props.projectLanguage}
						readOnly={(node.scheme ? Schemes[node.scheme].readOnly : true)}
						update={() => {
							this.forceUpdate();
						}}
						openRemoveItem={() => {
							this.setState({
								selectedID: id,
								modalRemoveItem: true
							})
						}}
						handleSelect={() => {
							if (ProjectSettings.selectedElements.includes(id))
								unhighlightElement(id)
							else highlightElement(id);
							this.forceUpdate();
						}}
						clearSelection={() => {
							resetDiagramSelection();
							this.forceUpdate();
						}}
						showDetails={() => {
							highlightElement(id);
							this.props.updateDetailPanel(id);
							let elem = graph.getElements().find(elem => elem.id === id);
							if (elem) {
								const scale = paper.scale().sx;
								paper.translate(0, 0);
								paper.translate((-elem.position().x * scale) + (paper.getComputedSize().width / 2) - elem.getBBox().width,
									(-elem.position().y * scale) + (paper.getComputedSize().height / 2) - elem.getBBox().height);
								updateDiagramPosition(ProjectSettings.selectedDiagram);
							}
							this.forceUpdate();
						}}
					/>)
				}
			}
			result.push(
				<PackageFolder
					key={node.scheme}
					projectLanguage={this.props.projectLanguage}
					node={node}
					update={() => {
						this.forceUpdate();
					}}
					readOnly={node.scheme ? Schemes[node.scheme].readOnly : false}
					handleSelect={() => {
						if (node.elements.every(id => ProjectSettings.selectedElements.includes(id)))
							ProjectSettings.selectedElements
								.filter(elem => (node.elements.includes(elem)))
								.forEach(elem => unhighlightElement(elem));
						else node.elements.forEach(elem => highlightElement(elem));
						this.forceUpdate();
					}}
				>{packageItems}</PackageFolder>);
		}
		return result;
	}

	render() {
		return (<ResizableBox
				className={"elements" + (this.props.error ? " disabled" : "")}
				width={300}
				height={1000}
				axis={"x"}
				handleSize={[8, 8]}
				onResizeStop={(e, d) => this.props.handleWidth(d.size.width)}
			>
				<div>
					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text id="inputGroupPrepend">
								<span role="img"
									  aria-label={Locale[ProjectSettings.viewLanguage].searchStereotypes}>🔎</span></InputGroup.Text>
						</InputGroup.Prepend>
						<Form.Control
							type="search"
							id={"searchInput"}
							placeholder={Locale[ProjectSettings.viewLanguage].searchStereotypes}
							aria-describedby="inputGroupPrepend"
							value={this.state.search}
							onChange={this.handleChangeSearch}
						/>
					</InputGroup>
					<div className={"elementLinkList"}>
						{this.getFolders()}
					</div>
					<ModalRemoveItem
						modal={this.state.modalRemoveItem}
						id={this.state.selectedID}
						close={() => {
							this.setState({modalRemoveItem: false});
						}}
						update={() => {
							this.forceUpdate();
							this.props.update();
						}}
						performTransaction={this.props.performTransaction}
					/>
				</div>
			</ResizableBox>
		);
	}
}
