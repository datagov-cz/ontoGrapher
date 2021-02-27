import {
	Languages,
	Links,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes,
	VocabularyElements
} from "../config/Variables";
import {initLanguageObject, parsePrefix} from "./FunctionEditVars";
import {ColorPool} from "../config/ColorPool";
import {Shapes} from "../config/Shapes";
import * as joint from "jointjs";
import {LinkConfig} from "../config/LinkConfig";
import {mvp1IRI, mvp2IRI} from "./FunctionGraph";

export function getVocabElementByElementID(id: string): { [key: string]: any } {
	return VocabularyElements[ProjectElements[id].iri];
}

export function getLinkOrVocabElem(iri: string): { [key: string]: any } {
	return iri in Links ? Links[iri] : VocabularyElements[iri];
}

export function getLabelOrBlank(labels: { [key: string]: string }, language: string): string {
    return labels[language] && labels[language].length > 0 ? labels[language] : "<blank>";
}

export function getNameOrBlank(name: string) {
    return name ? name : "<blank>";
}

export function isElemReadOnlyByIRI(iri: string): boolean {
    return Schemes[VocabularyElements[iri].inScheme].readOnly;
}

export function checkLabels() {
    for (const link in Links) {
		if (!(Links[link].labels[Object.keys(Languages)[0]])) {
			const label = link.lastIndexOf('/');
			Links[link].labels = initLanguageObject(link.substring(label + 1));
		}
		Links[link].typesDomain = [];
		Links[link].typesRange = [];
		Links[link].subClassOfDomain = [];
		Links[link].subClassOfRange = [];
		Links[link].defaultSourceCardinality = ProjectSettings.defaultCardinality;
		Links[link].defaultTargetCardinality = ProjectSettings.defaultCardinality;
	}
}

export function setSchemeColors(pool: string) {
    Object.keys(Schemes).forEach((scheme, i) => {
        Schemes[scheme].color = ColorPool[pool].colors[i];
    })
}

export function isConnectionWithTrope(link: string, id: string): boolean {
	if (ProjectLinks[link].iri === parsePrefix("z-sgov-pojem", "má-vlastnost") && ProjectLinks[link].source === id &&
		ProjectLinks[link].active && !ProjectElements[ProjectLinks[link].target].hidden[ProjectSettings.selectedDiagram]) {
		return true;
	} else if (ProjectLinks[link].iri === parsePrefix("z-sgov-pojem", "je-vlastností") && ProjectLinks[link].target === id &&
		ProjectLinks[link].active && !ProjectElements[ProjectLinks[link].source].hidden[ProjectSettings.selectedDiagram]) {
		return true;
	}
	return false;
}

export function getNewLink(type?: number, id?: string): joint.dia.Link {
	let link = new joint.shapes.standard.Link({id: id});
	if (type && type in LinkConfig) {
		link = LinkConfig[type].newLink(id);
	}
	return link;
}

export function getElementShape(id: string | number): string {
	const types = VocabularyElements[ProjectElements[id].iri].types;
	for (const type in Shapes) {
		if (types.includes(type)) return Shapes[type].body;
	}
	return Shapes["default"].body;
}

export function getActiveToConnections(id: string): string[] {
	return ProjectElements[id].connections.filter(conn => ProjectLinks[conn].active);
}

export function getUnderlyingFullConnections(link: joint.dia.Link): { src: string, tgt: string } | undefined {
	const id = link.id;
	const iri = ProjectLinks[id].iri;
	if (!(iri in VocabularyElements)) return;
	const sourceElem = link.getSourceCell()?.id;
	const targetElem = link.getTargetCell()?.id;
	if (sourceElem && targetElem) {
		const preds = Object.keys(ProjectElements).filter(id => ProjectElements[id].iri === iri);
		for (const pred of preds) {
			const sourceLink = Object.keys(ProjectLinks).find(id =>
				ProjectElements[pred].connections.includes(id) &&
				ProjectLinks[id].iri === mvp1IRI &&
				ProjectLinks[id].target === sourceElem &&
				ProjectLinks[id].active
			);
			const targetLink = Object.keys(ProjectLinks).find(id =>
				ProjectElements[pred].connections.includes(id) &&
				ProjectLinks[id].iri === mvp2IRI &&
				ProjectLinks[id].target === targetElem &&
				ProjectLinks[id].active
			);
			if (sourceLink && targetLink) return {src: sourceLink, tgt: targetLink};
		}
		return;
	}
}

export function getFullConnections(id: string): string[] {
	return Object.keys(ProjectElements).filter(elem => ProjectElements[elem].active &&
		parsePrefix("z-sgov-pojem", "typ-vztahu") === ProjectElements[elem].iri &&
		ProjectElements[elem].connections.find(link => ProjectLinks[link].active &&
			(ProjectLinks[link].iri === mvp1IRI || ProjectLinks[link].iri === mvp2IRI) &&
			ProjectLinks[link].target === id));
}

export function getElemFromIRI(iri: string) {
	return Object.keys(ProjectElements).find(elem => ProjectElements[elem].iri === iri);
}