// language code : language name
export var Languages: {[key:string]: string} = {};

export var ProjectSettings: {[key: string]: any} = {
    name: {},
    description: {}
};

//display:
//1 - namespace:name
//2 - rdfs:label
export var ViewSettings: {[key:string]: any} = {
    display: 2
};

export var StereotypeCategories = [
    "a", "b", "c"
];

//labels
//prefix
//suffix
//category
export var Stereotypes: {[key:string]: any} = {
    "asd": {
        labels: {
            cs: "asdcz",
            en: "asden"
        },
        category: "a"
    },
    "qwe": {
        labels: {
            cs: "qwecz",
            en: "qween"
        },
        category: "b"
    },
    "uio": {
        labels: {
            cs: "uiocz",
            en: "uioen"
        },
        category: "b"
    }
};

//name : address
export var Namespaces: {[key:string]: any} = {

};