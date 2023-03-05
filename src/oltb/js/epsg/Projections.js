import { LogManager } from "../core/managers/LogManager";

const FILENAME = 'epsg/Projections.js';
const PROJECTIONS = Object.freeze([
    {
        code: 'EPSG:3857',
        name: 'WGS 84 / Pseudo-Mercator',
        proj4def: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs'
    }, {
        code: 'EPSG:4326',
        name: 'WGS 84',
        proj4def: '+proj=longlat +datum=WGS84 +no_defs +type=crs'
    }, {
        code: 'EPSG:7789',
        name: 'ITRF2014',
        proj4def: '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs'
    }, {
        code: 'EPSG:3006',
        name: 'SWEREF99 TM',
        proj4def: '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
    }, {
        code: 'EPSG:3021',
        name: 'RT90 2.5 gon V',
        proj4def: '+proj=tmerc +lat_0=0 +lon_0=15.8082777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +towgs84=414.1,41.3,603.1,0.855,-2.141,7.023,0 +units=m +no_defs +type=crs'
    }
]);

const getProj4Defs = function() {
    const result = [];

    PROJECTIONS.forEach((projection) => {
        LogManager.logDebug(FILENAME, 'getProj4Defs', `${projection.code} (${projection.name})`);

        result.push([
            projection.code,
            projection.proj4def
        ]);
    });

    return result;
}

const hasProjection = function(name) {
    return PROJECTIONS.find((projection) => {
        return projection.code === name.toUpperCase();
    });
}

export { 
    PROJECTIONS, 
    getProj4Defs, 
    hasProjection 
};