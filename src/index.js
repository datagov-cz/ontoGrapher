import ReactDOM from 'react-dom';
import React from 'react';
import {DiagramApp} from "./diagram/DiagramApp";
import {Defaults} from "./config/Defaults";
ReactDOM.render(<DiagramApp loadDefaultVocabularies={true} immutableDefinitions={false} />,document.getElementById('app'));

