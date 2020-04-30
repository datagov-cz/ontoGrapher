export class PackageNode {
    public children: PackageNode[];
    public parent?: PackageNode;
    public elements: string[];
    public open: boolean;
    public scheme?: string;

    constructor(parent: PackageNode | undefined, open?: boolean, scheme?: string) {
        this.children = [];
        this.elements = [];
        if (parent) this.parent = parent;
        this.open = false;
        if (open !== undefined) this.open = open;
        if (scheme) this.scheme = scheme;
    }
}