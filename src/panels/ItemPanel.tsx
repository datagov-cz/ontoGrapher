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
	selectedElements: string[];
	shownElements: { [key: string]: { [key: string]: string[] } };
	selectedID: string;
}

export default class ItemPanel extends React.Component<Props, State> {
	private searchTimeout: number = 0;

	constructor(props: Props) {
		super(props);
		this.state = {
			filter: [],
			search: "",
			modalRemoveItem: false,
			selectedElements: ProjectSettings.selectedElements,
			shownElements: {},
			selectedID: "",
		};
		this.handleChangeSearch = this.handleChangeSearch.bind(this);
		this.handleOpenRemoveItemModal = this.handleOpenRemoveItemModal.bind(this);
		this.updateElements = this.updateElements.bind(this);
	}

	showItem(id: string) {
		PackageRoot.children.forEach(pkg => {
			if (!(pkg.open))
				pkg.open = pkg.elements.includes(id);
		});
		this.setState({shownElements: this.updateShownElements(), selectedID: id}, () => {
			const itemElement = document.getElementById(this.state.selectedID);
			if (itemElement) {
				itemElement.scrollIntoView({behavior: "smooth", block: "center"});
			}
		});
	}

	update(id?: string) {
		if (id) this.showItem(id);
		else this.forceUpdate();
	}

	updateElements() {
		this.setState({selectedElements: ProjectSettings.selectedElements, shownElements: this.updateShownElements()});
	}

	handleChangeSearch(event: React.ChangeEvent<HTMLSelectElement>) {
		PackageRoot.children.forEach(pkg => pkg.open = !(event.currentTarget.value === ""));
		this.setState({search: event.currentTarget.value});
		window.clearTimeout(this.searchTimeout);
		this.searchTimeout = window.setTimeout(() => this.setState({shownElements: this.updateShownElements()}), 100)
	}

	sort(a: string, b: string): number {
		const aLabel = getLabelOrBlank(VocabularyElements[ProjectElements[a].iri].labels, this.props.projectLanguage);
		const bLabel = getLabelOrBlank(VocabularyElements[ProjectElements[b].iri].labels, this.props.projectLanguage);
		return aLabel.localeCompare(bLabel);
	}

	search(id: string): boolean {
		const search = this.state.search.normalize().trim().toLowerCase();
		const name = getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage);
		return name.normalize().trim().toLowerCase().includes(search) ||
			VocabularyElements[ProjectElements[id].iri].altLabels
				.find(alt => alt.language === this.props.projectLanguage && alt.label.normalize().trim().toLowerCase().includes(search)) !== undefined;
	}

	updateShownElements() {
		const result: { [key: string]: { [key: string]: string[] } } = {};
		PackageRoot.children.forEach(node => {
			result[node.scheme] = {};
			Object.keys(Shapes).concat("unsorted").forEach(type => result[node.scheme][type] = []);
			if (node.open) {
				node.elements.sort((a, b) => this.sort(a, b)).filter(id =>
					this.search(id) &&
					(ProjectSettings.representation === Representation.FULL ||
						(ProjectSettings.representation === Representation.COMPACT &&
							(!(VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
									|| VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti")))
							)))).forEach(elem => {
					const types = VocabularyElements[ProjectElements[elem].iri].types;
					for (const key in Shapes) {
						if (types.includes(key)) {
							result[node.scheme][key].push(elem);
							break;
						}
					}
					if (!Object.values(result[node.scheme]).find(arr => arr.includes(elem)))
						result[node.scheme]['unsorted'].push(elem);
				});
			}
		});
		return result;
	}

	handleOpenRemoveItemModal(id: string) {
		this.setState({
			selectedID: id,
			modalRemoveItem: true
		})
	}

	getFolders(): JSX.Element[] {
		let result: JSX.Element[] = [];
		for (const node of PackageRoot.children) {
			const packageItems: JSX.Element[] = [];
			for (const iri in this.state.shownElements[node.scheme]) {
				if (this.state.shownElements[node.scheme][iri].length === 0) continue;
				packageItems.push(<PackageDivider
					key={iri}
					iri={iri}
					items={this.state.shownElements[node.scheme][iri]}
					visible={node.open}
					projectLanguage={this.props.projectLanguage}
					update={this.updateElements}
				/>);
				for (const id of this.state.shownElements[node.scheme][iri]) {
					packageItems.push(<PackageItem
						key={id}
						id={id}
						visible={node.open}
						projectLanguage={this.props.projectLanguage}
						readOnly={(node.scheme ? Schemes[node.scheme].readOnly : true)}
						update={this.updateElements}
						openRemoveItem={this.handleOpenRemoveItemModal}
						showDetails={this.props.updateDetailPanel}
					/>)
				}
			}
			result.push(
				<PackageFolder
					key={node.scheme}
					projectLanguage={this.props.projectLanguage}
					node={node}
					update={this.updateElements}
					readOnly={node.scheme ? Schemes[node.scheme].readOnly : false}
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
							this.updateElements();
							this.updateShownElements();
							this.props.update();
						}}
						performTransaction={this.props.performTransaction}
					/>
				</div>
			</ResizableBox>
		);
	}
}
