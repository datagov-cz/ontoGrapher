import {Locale} from "../config/Locale";
import {ProjectSettings} from "../config/Variables";

export class Cardinality {
    private first: string;
    private second: string;

    constructor(first: string, second: string) {
        this.first = first;
        this.second = second;
        if (!this.checkCardinalities()) {
            throw new Error(Locale[ProjectSettings.viewLanguage].errorInvalidCardinality);
        }
    }

    getString() {
        if (this.getFirstCardinality() === this.getSecondCardinality()) {
            return this.getFirstCardinality();
        } else {
            return this.getFirstCardinality() + ".." + this.getSecondCardinality();
        }
    }

    checkCardinality(cardinalityPart: string) {
        const regexp = new RegExp("(^\\d+$|^[*]$)");
        return cardinalityPart.length !== 1 || regexp.test(cardinalityPart) || cardinalityPart === "";
    }

    checkFirstCardinality() {
        return this.checkCardinality(this.first);
    }

    checkSecondCardinality() {
        return this.checkCardinality(this.second);
    }

    checkCardinalities() {
        if (this.isCardinalityNone()) return true;
        if (!this.checkFirstCardinality()) return false;
        if (!this.checkSecondCardinality()) return false;
        if (this.getFirstCardinality() === "" && this.getSecondCardinality() === "") return true;
        const regexpNumbers = new RegExp("^\\d+$");
        const regexpStar = new RegExp("^[*]$");
        if (regexpNumbers.test(this.getFirstCardinality()) && regexpNumbers.test(this.getSecondCardinality())) {
            const parseIntFirst = parseInt(this.getFirstCardinality());
            const parseIntSecond = parseInt(this.getSecondCardinality());
            return parseIntFirst <= parseIntSecond;
        }
        if (regexpStar.test(this.getFirstCardinality()) && regexpStar.test(this.getSecondCardinality())) return true;
        if (regexpStar.test(this.getFirstCardinality()) && regexpNumbers.test(this.getSecondCardinality())) return false;
        return regexpNumbers.test(this.getFirstCardinality()) && regexpStar.test(this.getSecondCardinality());

    }

    setFirstCardinality(cardinalityPart: string) {
        if (this.checkCardinality(cardinalityPart)) {
            this.first = cardinalityPart;
        } else {
            throw new Error(Locale[ProjectSettings.viewLanguage].errorInvalidCardinality);
        }
    }

    setSecondCardinality(cardinalityPart: string) {
        if (this.checkCardinality(cardinalityPart)) {
            this.second = cardinalityPart;
        } else {
            throw new Error(Locale[ProjectSettings.viewLanguage].errorInvalidCardinality);
        }
    }

    getFirstCardinality() {
        return this.first;
    }

    getSecondCardinality() {
        return this.second;
    }

    isCardinalityNone(): boolean {
        return this.getString() === ""
    }
}