// Note: 
// Square and Rectangle are not official geometries
// They are replaced with Circle-geometry at runtime
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

export { GeometryType };