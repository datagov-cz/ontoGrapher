import { en } from "../locale/en";
import { cs } from "../locale/cs";
import { enHelp } from "../locale/enhelp";
import { csHelp } from "../locale/cshelp";
import { enChangelog } from "../locale/enchangelog";
import { csChangelog } from "../locale/cschangelog";

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

export const LocaleChangelog: {
  [key: string]: {
    [key: string]: { [key: string]: { [key: string]: string[] } };
  };
} = {
  en: enChangelog,
  cs: csChangelog,
};
