export function mergeObjects(object1, object2) {
    for (let key in object2) {
        object1[key] = object2[key];
    }
}