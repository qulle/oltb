const FILENAME = 'constants/FeatureProperties.js';

// Note: These properties are placed inside the oltb object in the feature
// So the don't need to be prefixed
const FeatureProperties = Object.freeze({
    type: Object.freeze({
        layer: 'layer',
        marker: 'marker',
        windBarb: 'windBarb',
        measurement: 'measurement',
        drawing: 'drawing'
    }),
    tooltip: 'tooltip',
    infoWindow: 'infoWindow',
    notSelectable: 'notSelectable',
    highlightOnHover: 'highlightOnHover'
});

export { FeatureProperties };