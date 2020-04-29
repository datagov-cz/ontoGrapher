import * as joint from "jointjs";
import {ProjectElements, ProjectLinks, VocabularyElements} from "../config/Variables";

joint.linkTools.RemoveButton = joint.linkTools.Remove.extend({
    action: ((evt, view) => {
        let id = view.model.id;
        let sid = view.model.getSourceCell().id;
        if (ProjectElements[sid].connections.includes(id)) ProjectElements[sid].connections.splice(ProjectElements[sid].connections.indexOf(id), 1);
        if (vocabOrModal(ProjectLinks[id].iri)) {
            let domainOf = vocabOrModal(vocabOrModal(ProjectLinks[id].iri).domain).domainOf;
            if (domainOf && (vocabOrModal(ProjectLinks[id].iri).domain in VocabularyElements)) {
                domainOf.splice(domainOf.indexOf(ProjectLinks[id].iri), 1);
            }
        }
        delete ProjectLinks[id];
        view.model.remove();
    })
});