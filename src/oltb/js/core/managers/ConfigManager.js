import _ from "lodash";
import { LogManager } from "./LogManager";
import { VERSION as olVersion } from 'ol';
import { version as oltbVersion} from '../../../../../package.json';

const FILENAME = 'managers/ConfigManager.js';

const DefaultOptions = Object.freeze({
    url: '/config.json'
});

const DefaultConfig = Object.freeze({
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
            '#FFFFFF', // White
            '#D7E3FA', // Blue Light
            '#6397C2', // Blue Mid
            '#0166A5', // Blue Dark
            '#B1CAF6', // Indigo Light
            '#5B88D6', // Indigo Mid
            '#2357B1', // Indigo Dark
            '#D0CAFF', // Purple Light
            '#9085E4', // Purple Mid
            '#493E9C', // Purple Dark
            '#FEE6FF', // Pink Light
            '#E8A2EA', // Pink Mid
            '#914594', // Pink Dark
            '#BCF8FA', // Teal Light
            '#56BABD', // Teal Mid
            '#00959A', // Teal Dark
            '#CEEEFF', // Cyan Light
            '#68B9E5', // Cyan Mid
            '#0080C5', // Cyan Dark
            '#BCFAF4', // Green Light
            '#3CAEA3', // Green Mid
            '#007C70', // Green Dark
            '#FFF1C5', // Yellow Light
            '#FBDD83', // Yellow Mid
            '#FBBD02', // Yellow Dark
            '#FFDDBC', // Orange Light
            '#FCBE80', // Orange Mid
            '#F67D2C', // Orange Dark
            '#FDB5B4', // Red Light
            '#E96B69', // Red Mid
            '#EB4542', // Red Dark
            '#D3D9E6', // Gray Light
            '#959DAD', // Gray Mid
            '#3B4352', // Gray Dark
            '#000000'  // Black
        ]
    })
});

/**
 * About:
 * ConfigManager
 * 
 * Description:
 * Manages loading of dynamic runtime JSON config that is merged with the DefaultConfig above.
 */
class ConfigManager {
    static config;

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        options = _.merge(_.cloneDeep(DefaultOptions), options);

        return this.#loadConfigAsync(options.url);
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    static async #loadConfigAsync(url) {
        const timestamp = Date.now().toString();
        
        return fetch(`${url}?cache=${timestamp}`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Accept': 'application/json'
            },
        }).then((response) => {
            if(!response.ok) {
                throw new Error('Bad response from server', {
                    cause: response
                });
            }

            return response.json();
        }).then((data) => {
            this.config = _.merge(_.cloneDeep(DefaultConfig), data);

            LogManager.logDebug(FILENAME, 'loadConfigAsync', _.cloneDeep(this.config));

            return Promise.resolve({
                filename: FILENAME,
                result: true
            });
        }).catch((error) => {
            LogManager.logError(FILENAME, 'loadConfigAsync', {
                message: 'Failed to fetch configuration',
                error: error
            });

            return Promise.resolve({
                filename: FILENAME,
                result: false
            });
        });
    }
}

export { ConfigManager };