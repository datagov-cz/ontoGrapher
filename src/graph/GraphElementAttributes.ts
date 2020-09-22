import * as joint from "jointjs";

export var graphElementAttributes = joint.dia.Element.define('custom.graphElementAttributes', {
		attrs: {
			body: {
				ref: 'labelAttrs',
				refWidth: '100%',
				refHeight: '120%',
				refHeight2: '20',
				refWidth2: 20,
				strokeWidth: 2,
				stroke: '#000000',
				fill: '#FFFFFF'
			},
			label: {
				ref: 'body',
				textVerticalAnchor: 'middle',
				textAnchor: 'middle',
				refX: '50%',
				refY: '15',
				fill: '#333333'
			},
			labelAttrs: {
				textVerticalAnchor: 'top',
				textAnchor: 'start',
				fontSize: 12,
				x: 5,
				y: 25
			}
		}
	}, {
		markup: [{
			tagName: 'rect',
			selector: 'body',
		}, {
			tagName: 'text',
			selector: 'label'
		},{
			tagName: 'text',
			selector: 'labelAttrs'
		}]
	},
);