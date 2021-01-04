import React from 'react';
import {zoomDiagram} from "../../../function/FunctionDiagram";
import {paper} from "../../../main/DiagramCanvas";

interface Props {

}

interface State {

}

export default class ZoomWidget extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	render() {
		return (<span>
			<button onClick={() => {
				zoomDiagram(paper.translate().tx + (paper.getComputedSize().width / 2 * paper.scale().sx),
					paper.translate().ty + (paper.getComputedSize().height / 2 * paper.scale().sy), 1);
				this.forceUpdate();
			}}>➕</button>
			<button onClick={() => {
				zoomDiagram(paper.translate().tx + (paper.getComputedSize().width / 2 * paper.scale().sx),
					paper.translate().ty + (paper.getComputedSize().height / 2 * paper.scale().sy), -1);
				this.forceUpdate();
			}}>➖</button>
		</span>);
	}
}