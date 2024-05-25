import { VERSION as olVersion } from 'ol';
import * as packageJson from '../../../../../package.json';

// Note: 
// All config can be overridden by defining a custom config.json file. 
// That file is requested during the initAsync process by the ConfigManager.
const DefaultConfig = Object.freeze({
    timeFormat: Object.freeze({
        pretty: 'YYYY-MM-DD HH:mm:ss:SSS',
        gmt: 'YYYY-MM-DDTHH:mm:ssZ:SSS'
    }),
    localization: Object.freeze({
        active: 'en-us',
        languages: Object.freeze([
            'en-us',
            'sv-se'
        ])
    }),
    location: Object.freeze({
        default: Object.freeze({
            lon: 18.1201,
            lat: 35.3518,
            zoom: 3,
            rotation: 0
        })
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
        version: packageJson.version,
        id: 'oltb'
    }),
    urlParameter: Object.freeze({
        debug: 'oltb-debug',
        marker: 'oltb-marker'
    }),
    marker: Object.freeze({
        focusZoom: 6,
        label: {
            shouldRender: true,
            visibleUnderResolution: 5000
        },
        pulseAnimation: {
            isEnabled: true,
            duration: 2000,
            shouldLoop: true,
            strokeWidth: 1,
            defaultStartSize: 0,
            defaultEndSize: 14,
            defaultColor: '#3B4352FF'
        }
    }),
    scroll: Object.freeze({
        distance: 100
    }),
    browser: Object.freeze({
        rem: 16
    }),
    sessionStorage: Object.freeze({
        key: 'oltb'
    }),
    localStorage: Object.freeze({
        key: 'oltb'
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
        delay: [
            600, 
            100
        ]
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
        showPaletteAsDefault: true,
        palette: Object.freeze([
            '#F0F6FF', // Blue 100
            '#D7E3FA', // Blue 200
            '#6397C2', // Blue 300
            '#0166A5', // Blue 400
            '#00385B', // Blue 500
            '#E7EFFF', // Indigo 100
            '#C7D9F8', // Indigo 200
            '#5B88D6', // Indigo 300
            '#2357B1', // Indigo 400
            '#103677', // Indigo 500
            '#E8E6FF', // Purple 100
            '#D0CAFF', // Purple 200
            '#9085E4', // Purple 300
            '#52489B', // Purple 400
            '#2E2769', // Purple 500
            '#FEEDFF', // Pink 100
            '#FEE6FF', // Pink 200
            '#E8A2EA', // Pink 300
            '#914594', // Pink 400
            '#59275A', // Pink 500
            '#DDFEFF', // Teal 100
            '#BCF8FA', // Teal 200
            '#56BABD', // Teal 300
            '#00959A', // Teal 400
            '#005255', // Teal 500
            '#DFFFFC', // Green 100
            '#BCFAF4', // Green 200
            '#3CAEA3', // Green 300
            '#007C70', // Green 400
            '#004942', // Green 500
            '#E0F4FF', // Cyan 100
            '#CEEEFF', // Cyan 200
            '#68B9E5', // Cyan 300
            '#0080C5', // Cyan 400
            '#004367', // Cyan 500
            '#FFF8E1', // Yellow 100
            '#FBEAB2', // Yellow 200
            '#FBDD83', // Yellow 300
            '#FBBD02', // Yellow 400
            '#493B10', // Yellow 500
            '#FFEDDB', // Orange 100
            '#FFDDBC', // Orange 200
            '#FCBE80', // Orange 300
            '#F08741', // Orange 400
            '#6B310A', // Orange 500
            '#FFE6E6', // Red 100
            '#FDB5B4', // Red 200
            '#E96B69', // Red 300
            '#D64B49', // Red 400
            '#8D2120', // Red 500
            '#F3F4F5', // Gray 100
            '#D3D9E6', // Gray 200
            '#959DAD', // Gray 300
            '#3B4352', // Gray 400
            '#212529', // Gray 500
            '#000000', // Black
            '#FFFFFF'  // White
        ])
    })
});

export { DefaultConfig };