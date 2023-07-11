import { VERSION } from 'ol';
import { version } from '../../../../package.json';

const Config = Object.freeze({
    classNames: Object.freeze({
        row: 'oltb-row',
        dark: 'oltb-dark'
    }),
    openLayers: Object.freeze({
        version: VERSION,
        id: 'map'
    }),
    toolbar: Object.freeze({
        version: version,
        id: 'oltb'
    }),
    urlParameters: {
        debug: 'oltb-debug',
        marker: 'oltb-marker'
    },
    locale: 'en-us',
    timeFormat: 'YYYY-MM-DD HH:mm:ss:SSS',
    scrollDistance: 100,
    browser: Object.freeze({
        rem: 16
    }),
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
    autoRemovalDuation: Object.freeze({
        slow: 6000,
        normal: 4000,
        fast: 2000
    }),
    animationDuration: Object.freeze({
        slow: 450,
        normal: 350,
        fast: 250,
        warp: 150
    })
});

export { Config };