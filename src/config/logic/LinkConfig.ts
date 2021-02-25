import * as joint from 'jointjs';
import {initLanguageObject} from "../../function/FunctionEditVars"
import {generalizationLink} from "../../graph/uml/GeneralizationLink";
import {LinkType} from "../Enum";
import {updateDefaultLink, updateGeneralizationLink} from "../../queries/UpdateConnectionQueries";

export const LinkConfig: {
	[key: number]: {
		id: string,
		update: (id: string) => string,
		newLink: (id?: string) => joint.dia.Link,
		labels: { [key: string]: string }
	}
} = {
	[LinkType.DEFAULT]: {
		id: "default",
		labels: initLanguageObject(""),
		newLink: (id) => {
			if (id) return new joint.shapes.standard.Link({id: id});
			else return new joint.shapes.standard.Link();
		},
		update: (id: string) => updateDefaultLink(id)
	},
	[LinkType.GENERALIZATION]: {
		id: "generalization",
		labels: {"cs": "generalizace", "en": "generalization"},
		newLink: (id) => {
			if (id) return new generalizationLink({id: id});
			else return new generalizationLink();
		},
		update: (id: string) => updateGeneralizationLink(id)
	}
};

Object.freeze(LinkConfig);
