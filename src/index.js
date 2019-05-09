import ReactDOM from 'react-dom';
import React from 'react';
import {DiagramApp} from "./diagram/DiagramApp";
import {Defaults} from "./components/misc/Defaults";
ReactDOM.render(<DiagramApp loadOntology={Defaults.stereotypeUrl} />,document.getElementById('app'));