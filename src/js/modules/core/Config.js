import { version } from '/package.json';

const Config = {
    version: version,
    projection: 'EPSG:3857',
    locale: 'en-us',
    wgs84Projection: 'EPSG:4326',
    animationDuration: 350
};

export default Config;