import ReactDOM from 'react-dom';
import React from 'react';
import {DiagramApp} from "./diagram/DiagramApp";
ReactDOM.render(<DiagramApp loadDefaultVocabularies={true} lockConfig={true} />,document.getElementById('app'));

