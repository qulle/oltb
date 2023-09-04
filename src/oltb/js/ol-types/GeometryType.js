// Note: Square and Rectangle are not official geometries
// Replaced with Circle at runtime
const GeometryType = Object.freeze({
    Square: 'Square',
    Rectangle: 'Rectangle',
    Point: 'Point',
    Circle: 'Circle',
    Polygon: 'Polygon',
    LinearRing: 'LinearRing',
    LineString: 'LineString',
    MultiPoint: 'MultiPoint',
    MultiPolygon: 'MultiPolygon',
    MultiLineString: 'MultiLineString'
});

export { GeometryType };