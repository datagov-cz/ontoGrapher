export class PackageNode {
    public children: PackageNode[];
    public parent?: PackageNode;
    public elements: string[];
    public name: string;
    public open: boolean;
    constructor(name: string, parent: PackageNode | undefined, open?: boolean) {
        this.name = name;
        this.children = [];
        this.elements = [];
        if (parent) this.parent = parent;
        this.open = false;
        if (open !== undefined) this.open = open;
    }
}