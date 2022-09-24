const projections = [
    {
        code: '3857',
        name: 'WGS 84 / Pseudo-Mercator',
        proj4def: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
        bbox: '85.06,-180,-85.06,180'
    }, {
        code: '4326',
        name: 'WGS 84',
        proj4def: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
        bbox: '90,-180,-90,180'
    }, {
        code: '7789',
        name: 'ITRF2014',
        proj4def: '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs',
        bbox: '90,-180,-90,180'
    }, {
        code: '3006',
        name: 'SWEREF99 TM',
        proj4def: '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
        bbox: '69.07,10.03,54.96,24.17'
    }
];

const getProj4Defs = function() {
    const result = [];

    projections.forEach((projection) => {
        result.push([
            'EPSG:' + projection.code,
            projection.proj4def
        ]);
    });

    return result;
}

export { projections, getProj4Defs };