import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Table from "react-bootstrap/lib/Table";
import {LinkEndPool, LinkPool, StereotypePool} from "../../../config/Variables";
import {Form, FormControl, FormGroup, Tab, Tabs, Tooltip} from "react-bootstrap";
import * as SemanticWebInterface from "../../../interface/SemanticWebInterface";
import {Defaults} from "../../../config/Defaults";
import {Stereotype} from "../../../components/misc/Stereotype";

export class MenuSettingsLinks extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state = {
            link: Object.keys(LinkPool)[0],
            linkName: "",
            linkIRI: "",
            linkDescription: "",
            linkSource: "",
            linkSourceName: "",
        };
        this.focus = this.focus.bind(this);
        this.handleChangeLink = this.handleChangeLink.bind(this);
        this.handleChangeLinkName = this.handleChangeLinkName.bind(this);
        this.handleChangeLinkIRI = this.handleChangeLinkIRI.bind(this);
        this.handleChangeLinkDescription = this.handleChangeLinkDescription.bind(this);
        this.handleChangeLinkSource = this.handleChangeLinkSource.bind(this);
        this.handleLoadLinks = this.handleLoadLinks.bind(this);
        this.handleReplaceLinks = this.handleReplaceLinks.bind(this);
        this.deleteLink = this.deleteLink.bind(this);
        this.addLink = this.addLink.bind(this);
        this.handleChangeLinkSourceName = this.handleChangeLinkSourceName.bind(this);
    }

    addLink() {
        if (this.state.linkName !== "" && this.state.linkIRI !== "") {
            LinkPool[this.state.linkName] = ["Empty", true, false, [], this.state.linkIRI, this.state.linkDescription,""];
            this.setState({linkName: "", linkIRI: "", linkDescription: ""});
        }
    }

    deleteLink() {
        if (this.state.link !== undefined){
            if (Object.entries(LinkPool).length > 1) {
                delete LinkPool[Object.keys(LinkPool)[this.state.link]];
            }
        }
    }

    handleReplaceLinks() {
        if (this.state.linkSource !== "") {
            SemanticWebInterface.fetchRelationships(this.state.linkSource, Defaults.relationshipIRI, true, () => {
                this.setState({status: ""});
            });
        }
    }

    handleLoadLinks() {
        if (this.state.linkSource !== "") {
            SemanticWebInterface.fetchRelationships(this.state.linkSourceName, this.state.linkSource, Defaults.relationshipIRI, false, Defaults.sourceLanguage, () => {
                this.setState({status: "", linkSourceName: "", linkSource: ""});
            });
        }
    }

    focus() {
        if (Object.keys(LinkPool).length === 1) {
            this.setState({
                link: Object.keys(LinkPool)[0]
            });
        }
    }

    handleChangeLinkSourceName(event){
        this.setState({linkSourceName: event.target.value});
    }

    handleChangeLink(event){
        this.setState({link: event.target.value});
    }

    handleChangeLinkName(event){
        this.setState({linkName: event.target.value});
    }

    handleChangeLinkIRI(event){
        this.setState({linkIRI: event.target.value});
    }

    handleChangeLinkDescription(event){
        this.setState({linkDescription: event.target.value});
    }

    handleChangeLinkSource(event){
        this.setState({linkSource: event.target.value});
    }


    render(){
        let linkPool = Object.keys(LinkPool).map((link, i) => {
            return (
                <option key={i} value={i}>{link}</option>
            )
        });
        let linkPoolLength = linkPool.length;
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.linksSettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <FormGroup>
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.link}
                                onChange={this.handleChangeLink}
                                onFocus={this.focus}
                                size={linkPoolLength}
                                style={{height: 300}}
                            >
                                {linkPool}
                            </FormControl>

                            <Button onClick={this.deleteLink}
                                    bsStyle="danger">{Locale.deleteSelected}</Button>

                        </FormGroup>
                        <h4>{Locale.createNew+Locale.link}</h4>
                        <Tabs id="newStereotypes" animation={false}>
                            <Tab eventKey={1} title={Locale.manually}>
                                <Form>
                                    <FormControl
                                        type="text"
                                        value={this.state.linkName}
                                        placeholder={Locale.linkNamePlaceholder}
                                        onChange={this.handleChangeLinkName}
                                    />
                                    <FormControl
                                        type="text"
                                        value={this.state.linkIRI}
                                        placeholder={Locale.stereotypeRDFPlaceholder}
                                        onChange={this.handleChangeLinkIRI}
                                    />
                                    <FormControl
                                        type="text"
                                        value={this.state.linkDescription}
                                        placeholder={Locale.stereotypeDescriptionPlaceholder}
                                        onChange={this.handleChangeLinkDescription}
                                    />
                                    <Button onClick={this.addLink} bsStyle="primary">{Locale.addLink}</Button>
                                </Form>
                            </Tab>
                            <Tab eventKey={2} title={Locale.source}>
                                <FormControl
                                    type="text"
                                    value={this.state.linkSource}
                                    placeholder={Locale.stereotypeSourcePlaceholder}
                                    onChange={this.handleChangeLinkSource}
                                />
                                <FormControl
                                    type="text"
                                    value={this.state.linkSourceName}
                                    placeholder={Locale.stereotypeSourceNamePlaceholder}
                                    onChange={this.handleChangeLinkSourceName}
                                />
                                <Button onClick={this.handleLoadLinks}
                                        bsStyle="primary">{Locale.loadLinks}</Button>
                            </Tab>
                        </Tabs>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    // render(){
    //     let offset = 15;
    //     let horizontalOffset = 100;
    //     let linkListItems = Object.keys(LinkPool).map((link, i) => {
    //         let linkEnd = LinkEndPool[LinkPool[link][0]];
    //         return (<tr key={i}>
    //             <td>{i + 1}</td>
    //             <td>{link}</td>
    //             <td>
    //                 <svg width={150} height={30}>
    //                     <line x1={0} y1={offset} x2={horizontalOffset} y2={offset} stroke="black" strokeWidth={3}
    //                           strokeDasharray={LinkPool[link][2] ? "10,10" : "none"}/>
    //                     <polygon
    //                         points={`${linkEnd.x1 + horizontalOffset},${linkEnd.y1 + offset} ${linkEnd.x2 + horizontalOffset},${linkEnd.y2 + offset} ${linkEnd.x3 + horizontalOffset},${linkEnd.y3 + offset} ${linkEnd.x4 + horizontalOffset},${linkEnd.y4 + offset}`}
    //                         style={linkEnd.fill ?
    //                             {fill: "black", stroke: "black", strokeWidth: 2} :
    //                             {fill: "#eeeeee", stroke: "black", strokeWidth: 2}}
    //                     />
    //                     <text x={horizontalOffset} y={offset} alignmentBaseline="middle" textAnchor="middle"
    //                           fill="white" pointerEvents="none">{linkEnd.text}</text>
    //                 </svg>
    //             </td>
    //         </tr>);
    //     });
    //     return (
    //         <div>
    //             {this.getMenuItem()}
    //
    //             <Modal show={this.state.modal} onHide={this.handleCloseModal}>
    //                 <Modal.Header>
    //                     <Modal.Title>
    //                         {Locale.linksSettings}
    //                     </Modal.Title>
    //                 </Modal.Header>
    //                 <Modal.Body>
    //                     <br/>
    //                     <div height="300px">
    //                         <Table striped bordered hover condensed>
    //                             <thead>
    //                             <tr>
    //                                 <th>#</th>
    //                                 <th>{Locale.name}</th>
    //                                 <th>{Locale.line}</th>
    //                             </tr>
    //                             </thead>
    //                             <tbody>
    //                             {linkListItems}
    //                             </tbody>
    //                         </Table>
    //                     </div>
    //                 </Modal.Body>
    //                 <Modal.Footer>
    //                     <Button onClick={this.handleCloseModal} bsStyle="primary">{Locale.close}</Button>
    //                 </Modal.Footer>
    //             </Modal>
    //         </div>
    //     );
    // }
}