import _ from 'lodash';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { FeatureProperties } from '../../helpers/constants/feature-properties';
import { DefaultWindBarbOptions } from './default-wind-barb-options';
import { DefaultIconMarkerOptions } from './default-icon-marker-options';

const FILENAME = 'feature-manager.js';

/**
 * About:
 * FeatureManager
 * 
 * Description:
 * Used to create IconMarkers and WindBarbs and to check for internal properties on those generated Features.
 */
class FeatureManager extends BaseManager {
    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

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
    // # Section: Public API
    //--------------------------------------------------------------------
    static getType(feature) {
        return _.get(feature.getProperties(), ['oltb', 'type'], undefined);
    }

    static isWindBarbType(feature) {
        return _.get(feature.getProperties(), ['oltb', 'type'], undefined) === FeatureProperties.type.windBarb;
    }

    static isIconMarkerType(feature) {
        return _.get(feature.getProperties(), ['oltb', 'type'], undefined) === FeatureProperties.type.iconMarker;
    }

    static isMeasurementType(feature) {
        return _.get(feature.getProperties(), ['oltb', 'type'], undefined) === FeatureProperties.type.measurement;
    }
    
    static shouldHighlightOnHover(feature) {
        return _.get(feature.getProperties(), ['oltb', 'settings', 'shouldHighlightOnHover'], undefined) === true;
    }

    static hasInfoWindow(feature) {
        return _.has(feature.getProperties(), ['oltb', 'infoWindow']);
    }
    
    static getInfoWindow(feature) {
        return _.get(feature.getProperties(), ['oltb', 'infoWindow'], undefined);
    }

    static hasTooltip(feature) {
        return _.has(feature.getProperties(), ['oltb', 'tooltip']);
    }

    static getTooltip(feature) {
        return _.get(feature.getProperties(), ['oltb', 'tooltip'], undefined);
    }

    static generateWindBarb(options = {}) {
        options = _.merge(_.cloneDeep(DefaultWindBarbOptions), options);

        const feature = new Feature({
            geometry: new Point(fromLonLat([
                options.lon, 
                options.lat
            ]))
        });
    
        // TODO:
        // Make new function to generator the properties, duplicated code

        // Note:
        // The LayerManager is responsible to render the Wind Barb
        // This way the style can be optimized and controlled depending on the resolution/zoom-level
        feature.setProperties({
            oltb: {
                lon: options.lon,
                lat: options.lat,
                type: FeatureProperties.type.windBarb,
                infoWindow: options.infoWindow,
                title: options.title,
                description: options.description,
                settings: {
                    shouldReplaceHashtag: options.settings.shouldReplaceHashtag
                },
                icon: {
                    key: options.icon.key,
                    width: options.icon.width,
                    height: options.icon.height,
                    rotation: options.icon.rotation,
                    fill: options.icon.fill,
                    stroke: options.icon.stroke,
                    strokeWidth: options.icon.strokeWidth
                },
                label: {
                    text: options.label.text,
                    font: options.label.font,
                    fill: options.label.fill,
                    stroke: options.label.stroke,
                    strokeWidth: options.label.strokeWidth,
                    useEllipsisAfter: options.label.useEllipsisAfter,
                    useUpperCase: options.label.useUpperCase
                }
            }
        });
    
        return feature;
    }

    static generateIconMarker(options = {}) {
        options = _.merge(_.cloneDeep(DefaultIconMarkerOptions), options);

        const feature = new Feature({
            geometry: new Point(fromLonLat([
                options.lon, 
                options.lat
            ]))
        });
    
        // Note:
        // The LayerManager is responsible to render the IconMarker
        // This way the style can be optimized and controlled depending on the resolution/zoom-level
        feature.setProperties({
            oltb: {
                lon: options.lon,
                lat: options.lat,
                type: FeatureProperties.type.iconMarker,
                infoWindow: options.infoWindow,
                title: options.title,
                description: options.description,
                settings: {
                    shouldReplaceHashtag: options.settings.shouldReplaceHashtag
                },
                marker: {
                    width: options.marker.width,
                    radius: options.marker.radius,
                    fill: options.marker.fill,
                    stroke: options.marker.stroke,
                    strokeWidth: options.marker.strokeWidth
                },
                icon: {
                    key: options.icon.key,
                    width: options.icon.width,
                    height: options.icon.height,
                    rotation: options.icon.rotation,
                    fill: options.icon.fill,
                    stroke: options.icon.stroke,
                    strokeWidth: options.icon.strokeWidth
                },
                label: {
                    text: options.label.text,
                    font: options.label.font,
                    fill: options.label.fill,
                    stroke: options.label.stroke,
                    strokeWidth: options.label.strokeWidth,
                    useEllipsisAfter: options.label.useEllipsisAfter,
                    useUpperCase: options.label.useUpperCase
                }
            }
        });
    
        return feature;
    }
}

export { FeatureManager };