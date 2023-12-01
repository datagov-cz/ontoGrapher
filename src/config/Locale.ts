import { en } from "../locale/en";
import { cs } from "../locale/cs";
import { enHelp } from "../locale/enhelp";
import { csHelp } from "../locale/cshelp";
import { enToast } from "../locale/entoast";
import { csToast } from "../locale/cstoast";

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
