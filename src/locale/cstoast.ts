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
};
