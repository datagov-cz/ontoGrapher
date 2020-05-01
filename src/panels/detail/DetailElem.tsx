import * as LocaleMain from "../../locale/LocaleMain.json";
import React from "react";
import {ResizableBox} from "react-resizable";
import {ProjectElements, VocabularyElements} from "../../config/Variables";
import {getLabelOrBlank, isElemReadOnlyByID} from "../../function/FunctionGetVars";
import {Button, Tabs} from "react-bootstrap";
import ElemDescription from "./tabs/ElemDescription";
import ElemAttributes from "./tabs/ElemAttributes";
import ElemProperties from "./tabs/ElemProperties";
import ElemConnections from "./tabs/ElemConnections";
import ElemDiagrams from "./tabs/ElemDiagrams";

interface Props {
    projectLanguage: string;
    headers: { [key: string]: { [key: string]: string } }
    id: string;
    save: Function;
}

interface State {
    iri: string,
    inputConnections: string[];
    inputDiagrams: number[];
    changes: boolean;
}

export default class DetailElem extends React.Component<Props, State> {

    private readonly descriptionTab: React.RefObject<ElemDescription>;
    private readonly attributesTab: React.RefObject<ElemAttributes>;
    private readonly propertiesTab: React.RefObject<ElemProperties>;

    constructor(props: Props) {
        super(props);
		this.descriptionTab = React.createRef();
		this.attributesTab = React.createRef();
		this.propertiesTab = React.createRef();
		this.state = {
			iri: Object.keys(VocabularyElements)[0],
			inputConnections: [],
			inputDiagrams: [],
			changes: false
		}
	}

	prepareDetails() {
		this.setState({
			iri: ProjectElements[this.props.id].iri,
			inputConnections: ProjectElements[this.props.id].connections,
			inputDiagrams: ProjectElements[this.props.id].diagrams,
			changes: false
		});
		this.descriptionTab.current?.prepareDetails();
		this.attributesTab.current?.prepareDetails();
		this.propertiesTab.current?.prepareDetails();
		this.forceUpdate();
	}

	save() {
		this.props.save();
		this.descriptionTab.current?.save();
		this.attributesTab.current?.save();
		this.propertiesTab.current?.save();
		this.setState({changes: false});
	}

	render() {
        let eventKey = 1;
        return (<ResizableBox
            width={300}
            height={1000}
            axis={"x"}
            handleSize={[8, 8]}
            resizeHandles={['nw']}
            className={"details"}>
            <div>
				<h3>{getLabelOrBlank(VocabularyElements[ProjectElements[this.props.id].iri].labels, this.props.projectLanguage)}</h3>
                {this.state.changes ?
                    <p className={"bordered"}>
                        {LocaleMain.saveChanges}
                        <br/><br/>
                        <Button onClick={() => {
                            this.save();
                        }}>{LocaleMain.menuPanelSave}</Button></p> : <p/>}
                <Tabs id={"detailsTabs"}>
                    <ElemDescription
                        ref={this.descriptionTab}
                        eventKey={eventKey++}
                        changes={() => {
                            this.setState({changes: true})
                        }}
                        readOnly={isElemReadOnlyByID(this.props.id)}
                        headers={this.props.headers}
                        projectLanguage={this.props.projectLanguage}
                        id={this.props.id}
                    />
                    <ElemConnections
                        eventKey={eventKey++}
                        connections={this.state.inputConnections}
                        iri={this.state.iri}
                        projectLanguage={this.props.projectLanguage}/>
                    <ElemDiagrams
                        eventKey={eventKey++}
                        diagrams={this.state.inputDiagrams}
                    />
                    <ElemAttributes
                        ref={this.attributesTab}
                        eventKey={eventKey++}
                        readOnly={isElemReadOnlyByID(this.props.id)}
                        changes={() => {
                            this.setState({changes: true})
                        }}
                        id={this.props.id}
                    />
                    <ElemProperties
                        ref={this.propertiesTab}
                        eventKey={eventKey++}
                        changes={() => {
                            this.setState({changes: true})
                        }}
                        id={this.props.id}
                    />
                </Tabs>
            </div>
        </ResizableBox>);
    }
}