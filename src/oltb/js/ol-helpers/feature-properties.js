// Note: 
// These properties are placed inside the oltb object in the feature
// So they don't need to be prefixed with oltb
const FeatureProperties = Object.freeze({
    type: Object.freeze({
        layer: 'layer',
        iconMarker: 'iconMarker',
        windBarb: 'windBarb',
        measurement: 'measurement',
        drawing: 'drawing',
        snapLine: 'snapLine'
    })
});

export { FeatureProperties };