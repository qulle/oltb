import { VERSION } from 'ol';
import { version } from '../../../../package.json';

const FILENAME = 'core/Config.js';
const CONFIG = Object.freeze({
    OpenLayersVersion: VERSION,
    Version: version,
    Locale: 'en-us',
    TimeFormat: 'YYYY-MM-DD HH:mm:ss:SSS',
    ScrollDistance: 100,
    Browser: Object.freeze({
        REM: 16
    }),
    LocalStorage: Object.freeze({
        Key: 'oltb-state'
    }),
    Projection: Object.freeze({
        Default: 'EPSG:3857',
        WGS84: 'EPSG:4326'
    }),
    OverlayOffset: Object.freeze({
        Horizontal: 0,
        Vertical: -8
    }),
    DeviceWidth: Object.freeze({
        XS: '0',
        SM: '576',
        MD: '768',
        LG: '992',
        XL: '1200',
        XXL: '1400'
    }),
    AutoRemovalDuation: Object.freeze({
        Slow: 6000,
        Normal: 4000,
        Fast: 2000
    }),
    AnimationDuration: Object.freeze({
        Slow: 450,
        Normal: 350,
        Fast: 250
    })
});

export { CONFIG };