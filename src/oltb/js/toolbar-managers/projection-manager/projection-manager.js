import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';

const FILENAME = 'projection-manager.js';

/**
 * About:
 * ProjectionManager
 * 
 * Description:
 * Manages all EPSG projections.
 */
class ProjectionManager extends BaseManager {
    // Note: 
    // More projections can be fetched from here: https://epsg.io/
    static #projections = [{
        isActive: true,
        code: 'EPSG:3857',
        name: 'WGS 84 / Pseudo-Mercator',
        proj4def: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs'
    }, {
        isActive: true,
        code: 'EPSG:4326',
        name: 'WGS 84',
        proj4def: '+proj=longlat +datum=WGS84 +no_defs +type=crs'
    }, {
        isActive: true,
        code: 'EPSG:7789',
        name: 'ITRF2014',
        proj4def: '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs'
    }, {
        isActive: true,
        code: 'EPSG:3006',
        name: 'SWEREF99 TM',
        proj4def: '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
    }, {
        isActive: true,
        code: 'EPSG:3021',
        name: 'RT90 2.5 gon V',
        proj4def: '+proj=tmerc +lat_0=0 +lon_0=15.8082777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +towgs84=414.1,41.3,603.1,0.855,-2.141,7.023,0 +units=m +no_defs +type=crs'
    }];

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Adding default projections');

        const projectionsToAdd = [];
        this.#projections.forEach((projection) => {
            if(!projection.isActive) {
                LogManager.logDebug(FILENAME, 'initAsync', `Skipping projection (${projection.code} ${projection.name})`);
                return;
            }

            LogManager.logDebug(FILENAME, 'initAsync', `Adding projection (${projection.code} ${projection.name})`);
            projectionsToAdd.push([
                projection.code,
                projection.proj4def
            ]);
        });

        this.#registerProjections(projectionsToAdd);

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    static #registerProjections(projections) {
        proj4.defs(projections);
        register(proj4);
    }

    static #registerProjection(code, proj4def) {
        proj4.defs(code, proj4def);
        register(proj4);
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static addProjection(code, name, proj4def, active) {
        this.#projections.push({
            active: active,
            code: code,
            name: name,
            proj4def: proj4def
        });

        this.#registerProjection(code, proj4def);
    }

    static getSize() {
        return this.#projections.length || 0;
    }

    static getProjections() {
        return this.#projections;
    }

    static hasProjection(code) {
        return !!this.#projections.find((projection) => {
            return projection.code === code?.toUpperCase();
        });
    }
}

export { ProjectionManager };