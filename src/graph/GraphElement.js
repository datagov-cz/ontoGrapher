import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('examples.CustomTextElement', {
        attrs: {
            root: {
                magnet: false
            },
            body: {
                ref: 'label',
                refX: '-12.5%',
                refY: '-25%',
                refWidth: '125%',
                refHeight: '150%',
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            pointers: {
                pointerShape: 'rectangle',
                ref: 'label',
                refX: '-12.5%',
                refY: '-25%',
                refWidth: '125%',
                refHeight: '150%'
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
        markup: [
            {
                tagName: 'rect',
                selector: 'pointers',
                attributes: {
                    'magnet': 'on-shift',
                    'fill': 'transparent'
                }
            },
            {
                tagName: 'rect',
                selector: 'body',
                attributes: {
                    'pointer-events': 'none'
                 }
            },
            {
                tagName: 'text',
                selector: 'label'
            },]
    },
    {

        create: function (id) {
            return new this({id: id});
        }
        , attributes: {
            rough: {
                set: function (opt, bbox) {
                    var width = bbox.width;
                    var height = bbox.height;
                    var vel = joint.V('rect').attr({
                        'width': width,
                        'height': height
                    });
                    return {d: vel.convertToPathData()};
                }
            },
            pointerShape: {
                set: function (type, bbox) {

                    var width = bbox.width;
                    var height = bbox.height;
                    var vel = joint.V('rect').attr({
                        'width': width,
                        'height': height
                    });
                    return {d: vel.convertToPathData()};
                }
            }
        }
    }
);


//     joint.dia.Element.define('custom.customRectangle', {
//     z: 2,
//     attrs: {
//         root: {
//             magnet: false
//         },
//         pointers: {
//             pointerShape: 'rectangle',
//             ref:'label',
//             refX: 0,
//             refY: 0,
//             refWidth: '1.5',
//             refHeight: '1.5',
//         },
//         border: {
//             stroke: '#000',
//             strokeWidth: 1,
//             ref:'label',
//             refX: 0,
//             refY: 0,
//             refWidth: '1',
//             refHeight: '1.5',
//         },
//         body: {
//             ref:'label',
//             refX: 0,
//             refY: 0,
//             refWidth: '1',
//             refHeight: '1',
//             strokeWidth: 1,
//             stroke: '#000',
//             fill: '#FFFFFF'
//         },
//         label: {
//             textVerticalAnchor: 'middle',
//             textAnchor: 'middle',
//             refX: '50%',
//             refY: '50%',
//             pointerEvents: 'none'
//         }
//     }
// }, {
//     markup: [{
//         tagName: 'path',
//         selector: 'pointers',
//         attributes: {
//             'magnet': 'on-shift',
//             'fill': 'transparent'
//         }
//     }, {
//         tagName: 'rect',
//         selector: 'body',
//         attributes: {
//             'pointer-events': 'none',
//             'fill': 'transparent'
//         }
//     }, {
//         tagName: 'rect',
//         selector: 'border',
//         attributes: {
//             'pointer-events': 'none',
//             'fill': 'transparent'
//         }
//     }, {
//         tagName: 'text',
//         selector: 'label'
//     }]
// },
// {
//
//     create: function(id) {
//         return new this({id: id});
//     }
//     ,attributes: {
//         rough: {
//             set: function(opt, bbox) {
//                 var width = bbox.width;
//                 var height = bbox.height;
//                 var vel = joint.V('rect').attr({
//                     'width': width,
//                     'height': height
//                 });
//                 return { d: vel.convertToPathData() };
//             }
//         },
//         pointerShape: {
//             set: function(type, bbox) {
//
//                 var width = bbox.width;
//                 var height = bbox.height;
//                 var vel = joint.V('rect').attr({
//                     'width': width,
//                     'height': height
//                 });
//                 return { d: vel.convertToPathData() };
//             }
//         }
//     }
// });