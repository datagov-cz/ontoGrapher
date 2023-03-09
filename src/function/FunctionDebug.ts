import {
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceVocabularies,
  WorkspaceTerms,
  Links,
  Stereotypes,
  Diagrams,
  AppSettings,
} from "../config/Variables";
import { Cardinality } from "../datatypes/Cardinality";

export function dumpDebugData() {
  console.log(
    JSON.stringify({
      WorkspaceElements: WorkspaceElements,
      WorkspaceLinks: WorkspaceLinks,
      WorkspaceVocabularies: WorkspaceVocabularies,
      WorkspaceTerms: WorkspaceTerms,
      Links: Links,
      Stereotypes: Stereotypes,
      Diagrams: Diagrams,
      AppSettings: AppSettings,
    })
  );
}

export function loadDebugData(): boolean {
  console.trace();
  const json = require("../debug-data.json");
  if (!json) return false;
  for (const setting in json) {
    if (setting === "WorkspaceElements") {
      for (const element in json["WorkspaceElements"]) {
        WorkspaceElements[element] = json["WorkspaceElements"][element];
      }
    }
    if (setting === "WorkspaceLinks") {
      for (const element in json["WorkspaceLinks"]) {
        WorkspaceLinks[element] = json["WorkspaceLinks"][element];
        WorkspaceLinks[element].sourceCardinality = new Cardinality(
          json["WorkspaceLinks"][element].sourceCardinality.first,
          json["WorkspaceLinks"][element].sourceCardinality.second
        );
        WorkspaceLinks[element].targetCardinality = new Cardinality(
          json["WorkspaceLinks"][element].targetCardinality.first,
          json["WorkspaceLinks"][element].targetCardinality.second
        );
      }
    }
    if (setting === "WorkspaceVocabularies") {
      for (const element in json["WorkspaceVocabularies"]) {
        WorkspaceVocabularies[element] = json["WorkspaceVocabularies"][element];
      }
    }
    if (setting === "WorkspaceTerms") {
      for (const element in json["WorkspaceTerms"]) {
        WorkspaceTerms[element] = json["WorkspaceTerms"][element];
      }
    }
    if (setting === "Links") {
      for (const element in json["Links"]) {
        Links[element] = json["Links"][element];
      }
    }
    if (setting === "Stereotypes") {
      for (const element in json["Stereotypes"]) {
        Stereotypes[element] = json["Stereotypes"][element];
      }
    }
    if (setting === "Diagrams") {
      for (const element in json["Diagrams"]) {
        Diagrams[element] = json["Diagrams"][element];
      }
    }
    if (setting === "AppSettings") {
      AppSettings.name = json[setting]["name"];
      AppSettings.description = json[setting]["description"];
      AppSettings.selectedDiagram = json[setting]["selectedDiagram"];
      AppSettings.canvasLanguage = json[setting]["canvasLanguage"];
      AppSettings.contextIRIs = json[setting]["contextIRIs"];
      AppSettings.applicationContext = json[setting]["applicationContext"];
      AppSettings.initWorkspace = json[setting]["initWorkspace"];
      AppSettings.contextEndpoint = json[setting]["contextEndpoint"];
      AppSettings.ontographerContext = json[setting]["ontographerContext"];
      AppSettings.cacheContext = json[setting]["cacheContext"];
      AppSettings.luceneConnector = json[setting]["luceneConnector"];
      AppSettings.representation = json[setting]["representation"];
      AppSettings.defaultCardinalitySource = new Cardinality(
        json[setting]["defaultCardinalitySource"].first,
        json[setting]["defaultCardinalitySource"].second
      );
      AppSettings.defaultCardinalityTarget = new Cardinality(
        json[setting]["defaultCardinalityTarget"].first,
        json[setting]["defaultCardinalityTarget"].second
      );
      AppSettings.contextVersion = json[setting]["contextVersion"];
      AppSettings.latestContextVersion = json[setting]["latestContextVersion"];
      AppSettings.lastTransactions = json[setting]["lastTransactions"];
      AppSettings.lastTransactionID = json[setting]["lastTransactionID"];
      AppSettings.switchElements = json[setting]["switchElements"];
      AppSettings.defaultLanguage = json[setting]["defaultLanguage"];
      AppSettings.viewStereotypes = json[setting]["viewStereotypes"];
      AppSettings.viewZoom = json[setting]["viewZoom"];
      AppSettings.viewColorPool = json[setting]["viewColorPool"];
      AppSettings.viewItemPanelTypes = json[setting]["viewItemPanelTypes"];
      AppSettings.interfaceLanguage = json[setting]["interfaceLanguage"];
      AppSettings.selectedElements = json[setting]["selectedElements"];
      AppSettings.selectedLinks = json[setting]["selectedLinks"];
    }
  }
  return true;
}
