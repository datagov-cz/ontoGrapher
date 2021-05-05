export const enChangelog: {
  [key: string]: { [key: string]: { [key: string]: string[] } };
} = {
  "2021": {
    "5": {
      "12": [
        "Implemented the SSP cache for the Connections card in the Detail panel",
        "Under the ordinary list of connections within the workspace, you can now optionally see other connections to your selected term not currently represented in the workspace",
        'To view them, click the "Terms outside the workspace" link in the Connections card of the Detail panel',
        "All connection actions (dragging onto canvas, multiselection...) work for these connections as well",
      ],
    },
    "4": {
      "30": [
        "Implemented the SSP cache",
        "The search function now also searches the SSP cache and displays results below the usual workspace vocabularies",
        "The 📚 button can be used to group results by vocabularies",
        "The select can be used to filter results by vocabulary or vocabularies. If a vocabulary is selected and the search field is empty, the whole vocabulary is shown",
        "Hovering over a term reveals additional information about the term",
        "A ⭐ symbol next to the term signifies that the term is already in the workspace",
        "To add a term to the workspace, drag it onto the canvas as with any other term",
        "You can also ctrl + click onto terms to select multiple terms and ctrl + click on vocabularies to select all terms in the group",
        "The terms added can be read only",
        "The terms are added under a new read-only vocabulary. A counter is displayed if the vocabulary is not fully represented in the workspace. Clicking on this counter displays all the terms of the vocabulary",
      ],
    },
    "3": {
      "19": [
        "Changed the look of relationships listed in terms' detail panel:",
        "Terms listed there can now be (de)selected via left click",
        "Term(s) can be dragged onto the canvas the same way as from the left panel",
        "Added a row of buttons to the relationship view:",
        "The ➕ button adds the selected terms in a circular pattern as before",
        "The 🔍 button allows you to filter relationships by type, term label, stereotype, vocabulary, etc.",
      ],
    },
    "2": {
      "7": [
        "Formally added Czech language",
        "Added a Report button",
        "Changed the Help section to include a cheat sheet",
      ],
      "24": [
        "Changed behaviour of multiselection: selection in the left panel is reflected on the canvas and vice versa",
        "Change of controls described in the Help section",
      ],
    },
  },
};
