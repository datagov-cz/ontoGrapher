import { en } from "../locale/en";
import { cs } from "../locale/cs";
import { csHelp } from "../locale/cshelp";
import { csChangelog } from "../locale/cschangelog";
import { enPattern } from "../pattern/locale/enpattern";
import { csPattern } from "../pattern/locale/cspattern";

export const Locale: {
  [key: string]: { [Property in keyof typeof en]: string };
} = {
  en: cs,
  cs,
};

export const LocaleHelp: { [key: string]: { [key: string]: any } } = {
  en: csHelp,
  cs: csHelp,
};

export const LocaleChangelog: {
  [key: string]: {
    [key: string]: { [key: string]: { [key: string]: string[] } };
  };
} = {
  en: csChangelog,
  cs: csChangelog,
};

export const LocalePattern: {
  [key: string]: { [Property in keyof typeof enPattern]: string };
} = {
  en: csPattern,
  cs: csPattern,
};
