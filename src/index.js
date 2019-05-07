import ReactDOM from 'react-dom';
import React from 'react';
import {DiagramApp} from "./diagram/DiagramApp";
import {Defaults} from "./config/Defaults";
//ReactDOM.render(<DiagramApp loadDiagram={diagrams} />,document.getElementById('app'));
ReactDOM.render(<DiagramApp loadOntology={Defaults.stereotypeUrl} d />,document.getElementById('app'));