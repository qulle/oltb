import { version } from '/package.json';

const CONFIG = {
    version: version,
    locale: 'en-us',
    projection: 'EPSG:3857',
    wgs84Projection: 'EPSG:4326',
    animationDuration: {
        slow: 450,
        normal: 350,
        fast: 250
    }
};

export default CONFIG;