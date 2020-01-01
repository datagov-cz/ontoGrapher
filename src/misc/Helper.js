import {CardinalityPool, StereotypePool} from "../config/Variables";
import {Stereotype} from "../components/misc/Stereotype";

export function mergeObjects(object1, object2) {
    for (let key in object2) {
        object1[key] = object2[key];
    }
}

export function convertStringToBoolean(str: string){
    if (str === "true"){
        return true;
    } else if (str === "false"){
        return false;
    } else {
        return undefined;
    }
}

export function closeDropdown(){
    document.dispatchEvent(new MouseEvent('click'));
}

export function addSTP(input: Stereotype){
    for (let stp of StereotypePool){
        if (stp.iri === input.iri){
            return false;
        }
    }
    StereotypePool.push(input);
    return true;
}