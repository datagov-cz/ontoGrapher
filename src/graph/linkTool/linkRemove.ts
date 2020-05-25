import * as joint from "jointjs";
import {ProjectElements, ProjectLinks, ProjectSettings, Schemes, VocabularyElements} from "../../config/Variables";
import {updateConnections} from "../../interface/TransactionInterface";
// @ts-ignore
export var RemoveButton = joint.linkTools.Remove.extend({
    action: ((evt: any, view: { model: { id: any; getSourceCell: () => { (): any; new(): any; id: any; }; remove: () => void; }; }) => {
        let id = view.model.id;
        let sid = view.model.getSourceCell().id;
        if (ProjectElements[sid].connections.includes(id)) ProjectElements[sid].connections.splice(ProjectElements[sid].connections.indexOf(id), 1);
        let vocabElem = VocabularyElements[ProjectLinks[id].iri];
        if (vocabElem && vocabElem.domain) {
            let domainOf = VocabularyElements[vocabElem.domain].domainOf;
            if (domainOf && (Schemes[VocabularyElements[vocabElem.domain].inScheme].readOnly)) {
                domainOf.splice(domainOf.indexOf(ProjectLinks[id].iri), 1);
            }
        }
        updateConnections(ProjectSettings.contextEndpoint, sid, [id], "RemoveButton").then();
        delete ProjectLinks[id];
        view.model.remove();
    })
});