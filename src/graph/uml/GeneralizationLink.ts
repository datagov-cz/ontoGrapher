import * as joint from "jointjs";

export var generalizationLink = joint.shapes.standard.Link.define('custom.generalizationLink', {
	attrs: {
		line: {
			targetMarker: {
				'type': 'path',
				'stroke': 'black',
				'stroke-width': 2,
				'fill': 'white',
				'd': 'M 20 -10 0 0 20 10 Z'
			}
		}
	}
}, {}, {
	create: function (id: string) {
		return new this({id: id});
	}
})