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

interface Props {
	projectLanguage: string;
	handleChangeLoadingStatus: Function;
	handleWidth: Function;
	error: boolean;
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
	flash: boolean;
}

export default class ItemPanel extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {
			filter: [],
			flash: false,
			search: "",
			modalEditPackage: false,
			modalRemoveDiagram: false,
			modalRemoveItem: false,
			modalRemovePackage: false,
			modalRenameDiagram: false,
			selectedID: "",
			selectedDiagram: 0,
			selectedNode: PackageRoot
		};
		this.handleChangeSelect = this.handleChangeSelect.bind(this);
		this.handleChangeSearch = this.handleChangeSearch.bind(this);
	}

	update(position?: { x: number, y: number }) {
		if (position) {
			this.setState({flash: true});
			setTimeout(() => this.setState({flash: false}), 2000);
		}
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
		this.setState({search: event.currentTarget.value});
		this.forceUpdate();
	}

    getNameStereotype(element: string) {
        return Stereotypes[element].labels[this.props.projectLanguage];
    }

    getNameLink(element: string) {
        return Links[element].labels[this.props.projectLanguage];
    }

    getFoldersDFS(arr: JSX.Element[], node: PackageNode, depth: number) {
        if (node !== PackageRoot) {
            arr.push(<PackageFolder
				key={node.scheme}
				flash={this.state.flash}
				projectLanguage={this.props.projectLanguage}
				node={node}
				depth={depth}
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
			>
				{node.elements.sort((a, b) => VocabularyElements[ProjectElements[a].iri].labels[this.props.projectLanguage].localeCompare(
					VocabularyElements[ProjectElements[b].iri].labels[this.props.projectLanguage])).map((id) => {
					let name = VocabularyElements[ProjectElements[id].iri] ? getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage) : "<blank>";
					if (name.toLowerCase().startsWith(this.state.search.toLowerCase()) && (ProjectSettings.representation === Representation.FULL ||
						(ProjectSettings.representation === Representation.COMPACT &&
							!(VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
							)))) {
						return (
							<PackageItem
								key={id}
								label={name}
								depth={depth}
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
							/>
						)
					} else return "";

                    }
                )}
            </PackageFolder>);
        } else {
			node.elements.sort((a, b) =>
				VocabularyElements[ProjectElements[a].iri].labels[this.props.projectLanguage].localeCompare(
					VocabularyElements[ProjectElements[b].iri].labels[this.props.projectLanguage]))
				.forEach((id) => {
					if (ProjectSettings.representation === Representation.FULL ||
						(ProjectSettings.representation === Representation.COMPACT &&
							!(VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
							))) {
						arr.push(<PackageItem
							label={VocabularyElements[ProjectElements[id].iri] ? getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage) : "<blank>"}
							depth={depth} id={id}
							openRemoveItem={() => {
								this.setState({
									selectedID: id,
								modalRemoveItem: true
							})
						}}
						update={() => {
							this.forceUpdate();
						}}/>)
				}
			})

        }
        if (node.open) {
            for (let subnode of node.children) {
                this.getFoldersDFS(arr, subnode, depth + 1);
			}
		}
	}

	getFolders() {
		let result: JSX.Element[] = [];
		this.getFoldersDFS(result, PackageRoot, 0);
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
						type="text"
						placeholder={LocaleMain.searchStereotypes}
						aria-describedby="inputGroupPrepend"
						value={this.state.search}
						onChange={this.handleChangeSearch}
					/>
				</InputGroup>

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
					}}
					handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
				/>


			</ResizableBox>
        );
    }
}