import {ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
import {getNewLink} from "../function/FunctionGraph";
import {addLink} from "../function/FunctionCreateVars";
import {updateProjectLink} from "../interface/TransactionInterface";

export class ConnectionObject {
	public onProperty: string;
	public target: string;
	public initialize: boolean;

	constructor(onProperty: string, target: string, initialize: boolean = true) {
		this.onProperty = onProperty;
		this.target = target;
		this.initialize = initialize;
	}

	initConnection(source: string) {
		if (this.initialize) {
			let src = Object.keys(ProjectElements).filter(id => ProjectElements[id].iri === source);
			let tgt = Object.keys(ProjectElements).filter(id => ProjectElements[id].iri === this.target);
			for (let srcElem of src) {
				for (let tgtElem of tgt) {
					let link = getNewLink();
					if (typeof link.id === "string" && !ProjectElements[srcElem].connections.find(conn =>
						ProjectLinks[conn].iri === this.onProperty &&
						ProjectElements[ProjectLinks[conn].target].iri === this.target
					)) {
						addLink(link.id, this.onProperty, srcElem, tgtElem);
						ProjectElements[srcElem].connections.push(link.id);
						updateProjectLink(ProjectSettings.contextEndpoint, link.id);
					}
				}
			}
		}
	}
}