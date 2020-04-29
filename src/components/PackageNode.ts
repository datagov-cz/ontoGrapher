import {initLanguageObject} from "../function/Helper";

export class PackageNode {
    public children: PackageNode[];
    public parent?: PackageNode;
    public elements: string[];
    public name: { [key:string]: string };
    public open: boolean;
    public scheme?: string;
    constructor(name: string, parent: PackageNode | undefined, open?: boolean, scheme?: string) {
        this.name = initLanguageObject(name);
        this.children = [];
        this.elements = [];
        if (parent) this.parent = parent;
        this.open = false;
        if (open !== undefined) this.open = open;
        if (scheme) this.scheme = scheme;
    }
}