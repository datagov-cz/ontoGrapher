import { en } from "../locale/en";
import { cs } from "../locale/cs";
import { enHelp } from "../locale/enhelp";
import { csHelp } from "../locale/cshelp";
import { enChangelog } from "../locale/enchangelog";
import { csChangelog } from "../locale/cschangelog";
import { enPattern } from "../pattern/enpattern";
import { csPattern } from "../pattern/cspattern";

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

export const LocalePattern: {
  [key: string]: { [Property in keyof typeof enPattern]: string };
} = {
  en: enPattern,
  cs: csPattern,
};
