import { en } from "../locale/en";
import { cs } from "../locale/cs";
import { enHelp } from "../locale/enhelp";
import { csHelp } from "../locale/cshelp";
import { enChangelog } from "../locale/enchangelog";
import { csChangelog } from "../locale/cschangelog";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

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

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({ lng: "cs", resources: { en, cs } });
