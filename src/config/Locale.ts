import { en } from "../locale/en";
import { cs } from "../locale/cs";
import { enHelp } from "../locale/enhelp";
import { csHelp } from "../locale/cshelp";
import { enToast } from "../locale/entoast";
import { csToast } from "../locale/cstoast";
import { csDatatypes } from "../locale/csdatatypes";
import { enDatatypes } from "../locale/endatatypes";

export const Locale: {
  [key: string]: { [Property in keyof typeof en]: string };
} = {
  en,
  cs,
};

export const LocaleHelp: { [key: string]: { [key: string]: any } } = {
  en: enHelp,
  cs: csHelp,
};

export const LocaleToast: {
  [key: string]: {
    [key: string]: { header: string; content: string; caption?: string };
  };
} = {
  en: enToast,
  cs: csToast,
};

export const LocaleDatatypes: {
  [key: string]: { [key: string]: string };
} = {
  en: enDatatypes,
  cs: csDatatypes,
};
