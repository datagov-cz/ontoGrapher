import React from 'react';
import {ResizableBox} from "react-resizable";
import * as LocaleMain from "../locale/LocaleMain.json";
import {
	Links,
	PackageRoot,
	ProjectElements,
	ProjectSettings,
	Schemes,
	Stereotypes,
	VocabularyElements
} from "../config/Variables";
import PackageFolder from "./element/PackageFolder";
import {PackageNode} from "../datatypes/PackageNode";
import PackageItem from "./element/PackageItem";
import {getLabelOrBlank} from "../function/FunctionGetVars";
import ModalRemoveItem from "./modal/ModalRemoveItem";
import {updateProjectSettings} from "../interface/TransactionInterface";
import {Form, InputGroup} from 'react-bootstrap';
import {parsePrefix} from "../function/FunctionEditVars";
import {Representation} from "../config/Enum";
import PackageDivider from "./element/PackageDivider";
import {Shapes} from "../config/Shapes";

interface Props {
	projectLanguage: string;
	handleChangeLoadingStatus: Function;
	handleWidth: Function;
	error: boolean;
	update: Function;
}

interface State {
	filter: string[];
	search: string;
	modalEditPackage: boolean;
	modalRemoveDiagram: boolean;
	modalRemoveItem: boolean;
	modalRemovePackage: boolean;
	modalRenameDiagram: boolean;
	selectedID: string;
	selectedDiagram: number;
	selectedNode: PackageNode;
	selectionMode: boolean;
	selectedItems: string[];
}

export default class ItemPanel extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {
			filter: [],
			search: "",
			modalEditPackage: false,
			modalRemoveDiagram: false,
			modalRemoveItem: false,
			modalRemovePackage: false,
			modalRenameDiagram: false,
			selectedID: "",
			selectedDiagram: 0,
			selectedNode: PackageRoot,
			selectionMode: false,
			selectedItems: []
		};
		this.handleChangeSelect = this.handleChangeSelect.bind(this);
		this.handleChangeSearch = this.handleChangeSearch.bind(this);
	}

	update() {
		this.forceUpdate();
	}

	handleChangeSelect(event: any) {
		let result = [];
		if (Array.isArray(event)) {
			for (let e of event) {
				result.push(e.value);
			}
		}
		this.setState({filter: result});
		this.forceUpdate();
    }

    handleChangeSearch(event: React.ChangeEvent<HTMLSelectElement>) {
		PackageRoot.children.forEach(pkg => pkg.open = !(event.currentTarget.value === ""));
		this.setState({search: event.currentTarget.value});
		this.forceUpdate();
	}

	getNameStereotype(element: string) {
		return Stereotypes[element].labels[this.props.projectLanguage];
	}

	getNameLink(element: string) {
		return Links[element].labels[this.props.projectLanguage];
	}

	sort(a: string, b: string): number {
		let aLabel = VocabularyElements[ProjectElements[a].iri].labels[this.props.projectLanguage];
		let bLabel = VocabularyElements[ProjectElements[b].iri].labels[this.props.projectLanguage];
		return aLabel.localeCompare(bLabel);
	}

	categorizeTypes(elements: string[]): { [key: string]: string[] } {
		let result: { [key: string]: string[] } = {'unsorted': []};
		Object.keys(Shapes).forEach(type => result[type] = []);
		for (let elem of elements) {
			let types = VocabularyElements[ProjectElements[elem].iri].types;
			for (let key in Shapes) {
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

	getFolders(): JSX.Element[] {
		let result: JSX.Element[] = [];
		for (let node of PackageRoot.children) {
			let elements = node.elements.sort((a, b) => this.sort(a, b)).filter(id => {
				let name = VocabularyElements[ProjectElements[id].iri] ? getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage) : "<blank>";
				return (
					name.toLowerCase().includes(this.state.search.toLowerCase()) &&
					(ProjectSettings.representation === Representation.FULL ||
						(ProjectSettings.representation === Representation.COMPACT &&
							(!(VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
									|| VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti")))
							))))
			});
			let packageItems: JSX.Element[] = [];
			let categories = this.categorizeTypes(elements);
			for (let key in categories) {
				if (categories[key].length === 0) continue;
				if (ProjectSettings.viewItemPanelTypes) {
					let slice = elements.filter(elem => categories[key].includes(elem))
					packageItems.push(<PackageDivider
						key={Object.keys(Shapes).includes(key) ? key : ""}
						iri={Object.keys(Shapes).includes(key) ? key : ""}
						projectLanguage={this.props.projectLanguage}
						checkboxChecked={slice.every(elem => this.state.selectedItems.includes(elem))}
						handleShowCheckbox={() => {
							let items = this.state.selectedItems;
							if (slice.every(elem => this.state.selectedItems.includes(elem))) {
								slice.forEach(elem =>
									items.splice(this.state.selectedItems.indexOf(elem), 1))
							} else {
								slice.forEach(elem => items.push(elem))
							}
							this.setState({selectedItems: items, selectionMode: items.length > 0});
						}}
						showCheckbox={this.state.selectionMode}
					/>);
				}
				for (let id of categories[key]) {
					let name = VocabularyElements[ProjectElements[id].iri] ? getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage) : "<blank>";
					packageItems.push(<PackageItem
						key={id}
						label={name}
						id={id}
						update={() => {
							this.forceUpdate();
						}}
						openRemoveItem={() => {
							this.setState({
								selectedID: id,
								modalRemoveItem: true
							})
						}}
						checkboxChecked={this.state.selectedItems.includes(id)}
						handleShowCheckbox={() => {
							let items = this.state.selectedItems
							if (items.includes(id)) {
								items.splice(items.indexOf(id), 1)
							} else {
								items.push(id);
							}
							this.setState({selectedItems: items, selectionMode: (items.length > 0)})
						}}
						showCheckbox={this.state.selectionMode}
						selectedItems={this.state.selectedItems}
						clearSelection={() => {
							this.setState({selectedItems: [], selectionMode: false})
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
					openEditPackage={() => {
						this.setState({
							selectedNode: node,
							modalEditPackage: true
						})
					}}
					openRemovePackage={() => {
						this.setState({
							selectedNode: node,
							modalRemovePackage: true
						})
					}}
					readOnly={node.scheme ? Schemes[node.scheme].readOnly : false}
					checkboxChecked={node.elements.every(elem => this.state.selectedItems.includes(elem))}
					handleShowCheckbox={() => {
						let items = this.state.selectedItems;
						if (node.elements.every(elem => this.state.selectedItems.includes(elem))) {
							node.elements.forEach(elem =>
								items.splice(this.state.selectedItems.indexOf(elem), 1)
							)
							this.setState({selectedItems: items});
						} else {
							node.elements.forEach(elem =>
								items.push(elem)
							)
						}
						this.setState({selectedItems: items, selectionMode: items.length > 0});
					}}
					showCheckbox={this.state.selectionMode}
				>{packageItems}</PackageFolder>);
		}
		return result;
	}

	save() {
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint).then(result => {
			if (result) {
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
			}
		})
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
				<InputGroup>
					<InputGroup.Prepend>
						<InputGroup.Text id="inputGroupPrepend">
							<span role="img" aria-label={LocaleMain.searchStereotypes}>🔎</span></InputGroup.Text>
					</InputGroup.Prepend>
					<Form.Control
						type="search"
						placeholder={LocaleMain.searchStereotypes}
						aria-describedby="inputGroupPrepend"
						value={this.state.search}
						onChange={this.handleChangeSearch}
					/>
				</InputGroup>
				{/*{this.state.selectionMode &&*/}
				{/*<Button size={"sm"} variant={"secondary"} className={"wide"} onClick={()=>{*/}
				{/*	this.setState({selectionMode: false, selectedItems: []})*/}
				{/*}}>{LocaleMain.deselect + this.state.selectedItems.length + LocaleMain.items}</Button>}*/}
				<div className={"elementLinkList" + (this.props.error ? " disabled" : "")}>
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
					handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
				/>

			</ResizableBox>
        );
    }
}