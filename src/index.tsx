import React from 'react';
import ReactDOM from 'react-dom';
import DiagramApp from './diagram/DiagramApp';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<DiagramApp
    contextIRI={"http://example.org/pracovni-prostor/metadatový-kontext-123"}
    contextEndpoint={"http://localhost:7200/repositories/kodi-pracovni-prostor-validace"}
/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
