export const enToast: {
  [key: string]: { header: string; content: string; caption?: string };
} = {
  lookingForRelationshipsOrProperties: {
    header: "Looking for your relators or tropes?",
    content:
      "In Compact view, you can use relators created in other tools when creating a new relationship. Tropes are managed in concepts' detail panel",
  },
  diagramsClosedByDefault: {
    header: "Looking for your diagram tabs?",
    content:
      "In the new version of OntoGrapher, all diagrams have been closed for performance reasons. To open them again, use the Open diagram button when hovering over a diagram in the list on the Home tab.",
  },
  newFunctionEditTrope: {
    header: "Trope editing now available",
    content: "In the new version of OntoGrapher, you can edit tropes (their definitions and synonyms) within the detail panel of the parent term. In the list of tropes, click the info icon that shows when you point the mouse at a trope."
  }
};
