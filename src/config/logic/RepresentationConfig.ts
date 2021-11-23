import { Representation } from "../Enum";

export var RepresentationConfig: {
  [key in Representation]: { visibleStereotypes: string[] };
} = {
  [Representation.COMPACT]: {
    visibleStereotypes: [
      "https://slovník.gov.cz/základní/pojem/typ-objektu",
      "https://slovník.gov.cz/základní/pojem/typ-události",
    ],
  },
  [Representation.FULL]: {
    visibleStereotypes: [
      "https://slovník.gov.cz/základní/pojem/typ-objektu",
      "https://slovník.gov.cz/základní/pojem/typ-události",
      "https://slovník.gov.cz/základní/pojem/typ-vztahu",
      "https://slovník.gov.cz/základní/pojem/typ-vlastnosti",
    ],
  },
};
