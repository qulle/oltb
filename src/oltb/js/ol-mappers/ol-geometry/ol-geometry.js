import { createBox, createRegularPolygon } from "ol/interaction/Draw";

const FunctionOptions = Object.freeze([
    'Square',
    'Rectangle',
    'Circle'
]);

// Note: 
// Square and Rectangle are not official geometries
// They are replaced with Circle-geometry at runtime
const FunctionTypeMapper = Object.freeze({
    'Square': {
        type: 'Circle',
        callback: createRegularPolygon,
        parameters: 4
    },
    'Rectangle': {
        type: 'Circle',
        callback: createBox,
        parameters: undefined
    },
    'Circle': {
        type: 'Circle',
        callback: createRegularPolygon,
        parameters: 32
    }
});

const GeometryType = Object.freeze({
    Circle: 'Circle',
    LinearRing: 'LinearRing',
    LineString: 'LineString',
    MultiLineString: 'MultiLineString',
    MultiPoint: 'MultiPoint',
    MultiPolygon: 'MultiPolygon',
    Point: 'Point',
    Polygon: 'Polygon',
    Rectangle: 'Rectangle',
    Square: 'Square'
});

const instantiateGeometry = function(name) {
    const defaultGeometryType = 'Polygon';

    if(!(name in GeometryType)) {
        return [defaultGeometryType, undefined];
    }

    if(!(name in FunctionTypeMapper)) {
        return [name, undefined];
    }

    const mapper = FunctionTypeMapper[name];
    const type = mapper.type;
    const callback = mapper.callback;
    const parameters = mapper.parameters;

    return [ type, callback(parameters) ];
}

export { FunctionOptions, GeometryType, FunctionTypeMapper, instantiateGeometry };