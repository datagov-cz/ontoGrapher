import React from 'react';
import {ResizableBox} from "react-resizable";
import {Form, InputGroup, OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../locale/LocaleMain.json";
import {
	Diagrams,
	Links,
	PackageRoot,
	ProjectElements,
	ProjectSettings,
	Schemes,
	Stereotypes,
	VocabularyElements
} from "../config/Variables";
import ElementItem from "./element/ElementItem";
import {LinkItem} from "./element/LinkItem";
import DiagramItem from "./element/DiagramItem";
import PackageFolder from "./element/PackageFolder";
import {PackageNode} from "../datatypes/PackageNode";
import PackageItem from "./element/PackageItem";
import {createNewScheme} from "../function/FunctionCreateVars";
import {getLabelOrBlank} from "../function/FunctionGetVars";
import ModalEditPackage from "./modal/ModalEditPackage";
import ModalRemovePackage from "./modal/ModalRemovePackage";
import ModalRemoveItem from "./modal/ModalRemoveItem";
import ModalRenameDiagram from "./modal/ModalRenameDiagram";
import ModalRemoveDiagram from "./modal/ModalRemoveDiagram";
import {addDiagram} from "../function/FunctionDiagram";
import {updateProjectSettings} from "../interface/TransactionInterface";

interface Props {
	projectLanguage: string;
	handleChangeSelectedLink: Function;
	selectedLink: string;
	handleChangeLoadingStatus: Function;
	retry: boolean;
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
}

const tooltipS = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.classes}</Tooltip>}>
        <div><span role="img" aria-label={LocaleMain.classes}>⬜</span></div>
    </OverlayTrigger>
);
const tooltipR = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.relationships}</Tooltip>}>
        <div><span role="img" aria-label={LocaleMain.relationships}>➡</span></div>
    </OverlayTrigger>
);
const tooltipPM = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.packageModel}</Tooltip>}>
        <div><span role="img" aria-label={LocaleMain.packageModel}>📦</span></div>
    </OverlayTrigger>
);
const tooltipD = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.diagram}</Tooltip>}>
        <div><span role="img" aria-label={LocaleMain.diagram}>🖼️</span></div>
    </OverlayTrigger>
);

export default class ItemPanel extends React.Component<Props, State> {

	private stereotypes: string[];
	private links: string[];

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
			selectedNode: PackageRoot
		};
		this.links = Object.keys(Links);
		this.stereotypes = Object.keys(Stereotypes);
		this.handleChangeSelect = this.handleChangeSelect.bind(this);
		this.handleChangeSearch = this.handleChangeSearch.bind(this);
		this.search = this.search.bind(this);
		this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
	}

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
		if (prevProps !== this.props && ((this.props.retry && ProjectSettings.lastSource === ItemPanel.name))) {
			this.save();
		}
	}

	handleChangeSelectedLink(linkType: string) {
		this.props.handleChangeSelectedLink(linkType);
	}

	search(search: string, filter: string[]) {
		let result1 = [];
		for (let stereotype in Stereotypes) {
			if ((filter.includes(Stereotypes[stereotype].inScheme) || filter.length === 0)
				&& (
                    Stereotypes[stereotype].labels[this.props.projectLanguage].startsWith(search)
                )) {
                result1.push(stereotype);
            }
        }
        let result2 = [];
        for (let link in Links) {
            if ((filter.includes(Links[link].inScheme) || filter.length === 0)
                && (
                    Links[link].labels[this.props.projectLanguage].startsWith(search)
                )) {
                result2.push(link);
            }
        }
        this.stereotypes = result1;
        this.links = result2;
    }

    handleChangeSelect(event: any) {
        let result = [];
        if (Array.isArray(event)) {
            for (let e of event) {
                result.push(e.value);
            }
        }
        this.setState({filter: result});
        this.search(this.state.search, result);
        this.forceUpdate();
    }

    handleChangeSearch(event: React.ChangeEvent<HTMLSelectElement>) {
		this.setState({search: event.currentTarget.value});
		this.search(event.currentTarget.value, this.state.filter);
		this.forceUpdate();
	}

    getNameStereotype(element: string) {
        return Stereotypes[element].labels[this.props.projectLanguage];
    }

    getNameLink(element: string) {
        return Links[element].labels[this.props.projectLanguage];
    }

    update() {
        this.stereotypes = Object.keys(Stereotypes);
        this.links = Object.keys(Links);
        this.forceUpdate();
    }

    getFoldersDFS(arr: JSX.Element[], node: PackageNode, depth: number) {
        if (node !== PackageRoot) {
            arr.push(<PackageFolder
				key={node.scheme}
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
				{node.elements.sort((a, b) => ProjectElements[a].iri.localeCompare(ProjectElements[b].iri)).map((id) => {
					let name = getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage);
					if (name.startsWith(this.state.search)) {
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
            node.elements.forEach((id) => {
                arr.push(<PackageItem
					label={getLabelOrBlank(VocabularyElements[ProjectElements[id].iri].labels, this.props.projectLanguage)}
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
		updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint, ItemPanel.name).then(result => {
			if (result) {
				this.props.handleChangeLoadingStatus(false, "", false);
			} else {
				this.props.handleChangeLoadingStatus(false, "", true);
			}
		})
	}

	render() {
		return (<ResizableBox
				className={"elements"}
				width={300}
				height={1000}
				axis={"x"}
				handleSize={[8, 8]}
				resizeHandles={['ne']}
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
                <Tabs id="stereotypePanelTabs">
                    <Tab eventKey={1} title={tooltipS}>
                        <div className={"elementList"}>
							{this.stereotypes.sort().map((element) => (
								<ElementItem
									key={element}
									iri={element}
									definition={Stereotypes[element].definitions[this.props.projectLanguage]}
									label={Stereotypes[element].labels[this.props.projectLanguage]}
									scheme={Schemes[Stereotypes[element].inScheme].labels[this.props.projectLanguage]}
								/>))}
                        </div>
                    </Tab>
                    <Tab eventKey={2} title={tooltipR}>
                        <div className="elementList">
							{this.links.sort().map((link) => <LinkItem
									key={link}
									selectedLink={this.props.selectedLink}
									handleChangeSelectedLink={this.handleChangeSelectedLink}
									linkType={link}
									scheme={Schemes[Links[link].inScheme].labels[this.props.projectLanguage]}
									definition={Links[link].definitions[this.props.projectLanguage]}
									label={Links[link].labels[this.props.projectLanguage]}
								/>
							)}
						</div>
					</Tab>
					<Tab eventKey={3} title={tooltipPM}>
						{!ProjectSettings.contextIRI && <button className={"margins"} onClick={() => {
							let scheme = createNewScheme();
							new PackageNode(Schemes[scheme].labels, PackageRoot, true, scheme);
							this.forceUpdate();
						}
						}>{LocaleMain.addNewPackage}</button>}
						<div className="elementLinkList">
							{this.getFolders()}
						</div>
					</Tab>
					<Tab eventKey={4} title={tooltipD}>
						<button className={"margins"} onClick={() => {
							this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
							addDiagram();
							this.save();
							this.forceUpdate();
						}
                        }>{LocaleMain.addDiagram}</button>
                        <div className="elementLinkList">
                            {Diagrams.map((model, i) => <DiagramItem
								retry={this.props.retry}
								key={i}
								diagram={i}
								selectedDiagram={ProjectSettings.selectedDiagram}
								update={() => {
									this.forceUpdate();
								}}
								openRemoveDiagram={() => {
									this.setState({
										selectedDiagram: i,
										modalRemoveDiagram: true
										})
									}}
									openRenameDiagram={() => {
										this.setState({
											selectedDiagram: i,
											modalRenameDiagram: true
										})
									}}
									handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
								/>
							)}
						</div>
					</Tab>
				</Tabs>

				<ModalEditPackage
					modal={this.state.modalEditPackage}
					node={this.state.selectedNode}
					close={() => {
						this.setState({modalEditPackage: false});
					}}
					projectLanguage={this.props.projectLanguage}
					update={() => {
						this.forceUpdate();
					}}
				/>

				<ModalRemovePackage
					modal={this.state.modalRemovePackage}
					node={this.state.selectedNode}
					close={() => {
						this.setState({modalRemovePackage: false});
					}}
					update={() => {
						this.forceUpdate();
					}}
				/>

				<ModalRemoveItem
					modal={this.state.modalRemoveItem}
					id={this.state.selectedID}
					close={() => {
						this.setState({modalRemoveItem: false});
					}}
					update={() => {
						this.forceUpdate();
					}}
					retry={this.props.retry}
					handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
				/>

				<ModalRenameDiagram
					modal={this.state.modalRenameDiagram}
					diagram={this.state.selectedDiagram}
					close={() => {
						this.setState({modalRenameDiagram: false});
					}}
					update={() => {
						this.forceUpdate();
					}}
					handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
					retry={this.props.retry}
				/>

				<ModalRemoveDiagram
					modal={this.state.modalRemoveDiagram}
					diagram={this.state.selectedDiagram}
					close={() => {
						this.setState({modalRemoveDiagram: false});
					}}
					update={() => {
						this.forceUpdate();
					}}
					handleChangeLoadingStatus={this.props.handleChangeLoadingStatus}
					retry={this.props.retry}
				/>

			</ResizableBox>
        );
    }
}