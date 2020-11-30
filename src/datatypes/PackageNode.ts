export class PackageNode {
	public labels: { [key: string]: string };
	public children: PackageNode[];
	public parent?: PackageNode;
	public elements: string[];
	public open: boolean;
	public scheme: string;

	constructor(labels: { [key: string]: string }, parent: PackageNode | undefined, open: boolean, scheme: string) {
		this.labels = labels;
		this.children = [];
		this.elements = [];
		if (parent) {
			this.parent = parent;
			this.parent.children.push(this);
		}
		this.open = false;
		this.open = open;
		this.scheme = scheme;
	}

}