const FILENAME = 'constants/FeatureProperties.js';
const FEATURE_PROPERTIES = Object.freeze({
    Type: Object.freeze({
        Layer: 'layer',
        Marker: 'marker',
        WindBarb: 'windBarb',
        Measurement: 'measurement',
        Drawing: 'drawing'
    }),
    Tooltip: 'tooltip',
    InfoWindow: 'infoWindow',
    NotSelectable: 'notSelectable',
    HighlightOnHover: 'highlightOnHover'
});

export { FEATURE_PROPERTIES };