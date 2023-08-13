import { VERSION as olVersion } from 'ol';
import { version as oltbVersion} from '../../../../package.json';

const Config = Object.freeze({
    defaultLocation: Object.freeze({
        lon: 18.1201,
        lat: 35.3518,
        zoom: 3,
        rotation: 0
    }),
    className: Object.freeze({
        row: 'oltb-row',
        dark: 'oltb-dark'
    }),
    openLayers: Object.freeze({
        version: olVersion,
        id: 'map'
    }),
    toolbar: Object.freeze({
        version: oltbVersion,
        id: 'oltb'
    }),
    urlParameter: {
        debug: 'oltb-debug',
        marker: 'oltb-marker'
    },
    marker: {
        focusZoom: 6
    },
    locale: 'en-us',
    timeFormat: 'YYYY-MM-DD HH:mm:ss:SSS',
    scrollDistance: 100,
    browser: Object.freeze({
        rem: 16
    }),
    localStorage: Object.freeze({
        key: 'oltb.state'
    }),
    projection: Object.freeze({
        default: 'EPSG:3857',
        wgs84: 'EPSG:4326'
    }),
    overlayOffset: Object.freeze({
        horizontal: 0,
        vertical: -8
    }),
    tippy: Object.freeze({
        offset: [600, 100]
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
    }),
    aColorPicker: Object.freeze({
        palette: [
            '#FFFFFF',
            '#D7E3FA',
            '#6397C2',
            '#0166A5',
            '#B1CAF6',
            '#5B88D6',
            '#2357B1',
            '#D0CAFF',
            '#9085E4',
            '#493E9C',
            '#FEE6FF',
            '#E8A2EA',
            '#914594',
            '#BCF8FA',
            '#56BABD',
            '#00959A',
            '#CEEEFF',
            '#68B9E5',
            '#0080C5',
            '#BCFAF4',
            '#3CAEA3',
            '#007C70',
            '#FFF1C5',
            '#FBDD83',
            '#FBBD02',
            '#FFDDBC',
            '#FCBE80',
            '#F67D2C',
            '#FDB5B4',
            '#E96B69',
            '#EB4542',
            '#D3D9E6',
            '#959DAD',
            '#3B4352',
            '#000000'
        ]
    })
});

export { Config };