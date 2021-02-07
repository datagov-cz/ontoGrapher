import {en} from "../locale/en";
import {cs} from "../locale/cs";
import {enHelp} from "../locale/enhelp";
import {csHelp} from "../locale/cshelp";

export const Locale: { [key: string]: { [key: string]: string } } = {
	en: en,
	cs: cs
}

export const LocaleHelp: { [key: string]: { [key: string]: any } } = {
	en: enHelp,
	cs: csHelp
}