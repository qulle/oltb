import { version } from '../../../../package.json';

const CONFIG = Object.freeze({
    version: version,
    locale: 'en-us',
    scrollDistance: 100,
    rem: 16,
    localStorage: Object.freeze({
        key: 'oltb-state'
    }),
    projection: Object.freeze({
        default: 'EPSG:3857',
        wgs84: 'EPSG:4326'
    }),
    overlayOffset: Object.freeze({
        horizontal: 0,
        vertical: -8
    }),
    deviceWidth: Object.freeze({
        xs: '0',
        sm: '576',
        md: '768',
        lg: '992',
        xl: '1200',
        xxl: '1400'
    }),
    animationDuration: Object.freeze({
        slow: 450,
        normal: 350,
        fast: 250
    })
});

export default CONFIG;