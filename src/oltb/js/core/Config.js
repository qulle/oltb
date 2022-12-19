import { version } from '../../../../package.json';

const CONFIG = Object.freeze({
    Version: version,
    Locale: 'en-us',
    ScrollDistance: 100,
    Rem: 16,
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
    AnimationDuration: Object.freeze({
        Slow: 450,
        Normal: 350,
        Fast: 250
    })
});

export default CONFIG;