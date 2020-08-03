import * as joint from "jointjs";

export var ElemCreateLink = joint.elementTools.Button.extend({
	name: 'create-link-button',
	options: {
		markup: [{
			tagName: 'circle',
			selector: 'button',
			attributes: {
				'r': 10,
				'fill': '#ffd500',
				'cursor': 'pointer'
			}
		}, {
			tagName: 'line',
			selector: 'icon',
			attributes: {
				'stroke': '#000',
				'strokeWidth': 2,
				'x1': -5,
				'x2': 5,
				'y1': -5,
				'y2': 5
			}
		}, {
			tagName: 'polygon',
			attributes: {
				'fill': '#000',
				'points': '0 5, 5 0, 5 5'
			}
		}],
		distance: 60,
		offset: 0,
	}
});