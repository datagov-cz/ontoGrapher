import * as joint from "jointjs";
import {ProjectElements, ProjectLinks, ProjectSettings} from "../../config/Variables";
import {updateConnections} from "../../interface/TransactionInterface";
// @ts-ignore
export var RemoveButton = joint.linkTools.Remove.extend({
    action: ((evt: any, view: { model: { id: any; getSourceCell: () => { (): any; new(): any; id: any; }; remove: () => void; }; }) => {
        let id = view.model.id;
        let sid = view.model.getSourceCell().id;
        if (ProjectElements[sid].connections.includes(id)) ProjectElements[sid].connections.splice(ProjectElements[sid].connections.indexOf(id), 1);
        updateConnections(ProjectSettings.contextEndpoint, id, [id], "RemoveButton").then();
        ProjectLinks[id].active = false;
        view.model.remove();
    })
});