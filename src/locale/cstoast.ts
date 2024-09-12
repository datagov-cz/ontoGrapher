import { enToast } from "./entoast";

export const csToast: {
  [Key in keyof typeof enToast]: {
    header: string;
    content: string;
    caption?: string;
  };
} = {
  lookingForRelationshipsOrProperties: {
    header: "Hledáte vaše vazby či vlastnosti?",
    content:
      "V kompaktním pohledu můžete používat typy vztahů vytvořené v jiných nástrojích při vytváření nových vztahů mezi pojmy. Vlastnosti se spravují v detailu pojmů.",
  },
  diagramsClosedByDefault: {
    header: "Hledáte své diagramy?",
    content:
      "V nové verzi OntoGrapheru byly uzavřeny všechny diagramy. Pro jejich znovuotevření použijte tlačítko Otevřít diagram, které se zobrazí při najetí myší na položku diagramu v domovské kartě.",
  },
  newFunctionEditTrope: {
    header: "Nyní dostupné: úprava vlastností",
    content: "V nové verzi OntoGrapheru můžete upravovat vlastnosti (jejich definice a synonyma) pojmů v detailu daného pojmu. Stačí v seznamu vlastností pojmu kliknout na Info ikonku, která se zobrazí při najetí myší na danou vlastnost."
  },
  newFunctionDescriptionAndSources: {
    header: "Nyní dostupné: úprava zdrojů a popisů",
    content: "V nové verzi OntoGrapheru nyní lze upravovat zdroje (dct:source) a popisy (skos:scopeNote) v detailu pojmů a vybraných vztahů."
  }
};
