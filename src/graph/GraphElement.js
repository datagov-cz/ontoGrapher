import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('element.Rectangle', {
    z: 2,
    attrs: {
        root: {
            magnet: false
        },
        pointers: {
            pointerShape: 'rectangle'
        },
        border: {
            stroke: '#000',
            strokeWidth: 1
        },
        body: {
            strokeWidth: 1,
            stroke: '#000',
            fill: '#FFFFFF'
        },
        label: {
            textVerticalAnchor: 'middle',
            textAnchor: 'middle',
            refX: '50%',
            refY: '50%',
            pointerEvents: 'none'
        }
    }
}, {
    markup: [{
        tagName: 'path',
        selector: 'pointers',
        attributes: {
            'magnet': 'on-shift',
            'fill': 'transparent'
        }
    }, {
        tagName: 'path',
        selector: 'body',
        attributes: {
            'pointer-events': 'none',
            'fill': 'transparent'
        }
    }, {
        tagName: 'path',
        selector: 'border',
        attributes: {
            'pointer-events': 'none',
            'fill': 'transparent'
        }
    }, {
        tagName: 'text',
        selector: 'label'
    }]
}, {

    create: function(type) {
        return new this({
            attrs: {
                pointers: {
                    pointerShape: 'rectangle'
                },
                body: {
                    rough: {
                        type: 'rectangle'
                    }
                },
                border: {
                    rough: {
                        type: 'rectangle'
                    }
                }
            }
        });
    },

    attributes: {
        rough: {
            set: function(opt, bbox) {
                var width = bbox.width;
                var height = bbox.height;
                var vel = joint.V('rect').attr({
                    'width': width,
                    'height': height
                });
                return { d: vel.convertToPathData() };
            }
        },
        pointerShape: {
            set: function(type, bbox) {

                var width = bbox.width;
                var height = bbox.height;
                var vel = joint.V('rect').attr({
                    'width': width,
                    'height': height
                });
                return { d: vel.convertToPathData() };
            }
        }
    }
});