//TODO: finish cardinalities
export class Cardinality {

    singleCardinality: boolean;

    constructor(first: string, second: string){

    }

    constructor(cardinality: string){
        if (this.checkCardinality(cardinality)){
            this.singleCardinality = true;
            this.setFirstCardinality(cardinality);
            this.setSecondCardinality(cardinality);
        }
    }

    checkCardinality(cardinalityPart: string){
        let regexp = new RegExp("(^\\d+$|^[*]$)");
        return cardinalityPart.length !== 1 || regexp.text(cardinalityPart);
    }

    checkFirstCardinality(){
        return this.checkCardinality(this.first);
    }

    checkSecondCardinality(){
        return this.checkCardinality(this.second);
    }

    checkCardinalities(){
        if (!this.checkFirstCardinality()) return false;
        if (!this.checkSecondCardinality()) return false;
        let regexpNumbers = new RegExp("^\\d+$");
        let regexpStar = new RegExp("^[*]$");
        let parseIntFirst = parseInt(this.getFirstCardinality());
        if (regexpNumbers.text(this.getFirstCardinality()) && regexpNumbers.test(this.getSecondCardinality()))
        return true;
    }

    setFirstCardinality(cardinalityPart: string){
        if (this.checkCardinality(cardinalityPart)){
            this.first = cardinalityPart;
        }
    }

    setSecondCardinality(cardinalityPart: string){
        if (this.checkCardinality(cardinalityPart)){
            this.second = cardinalityPart;
        }
    }

    getFirstCardinality(){
        return this.first;
    }

    getSecondCardinality(){
        return this.second;
    }
}