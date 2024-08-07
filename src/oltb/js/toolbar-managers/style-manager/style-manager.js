import _ from 'lodash';
import ManyKeysMap from 'many-keys-map';
import { MultiPoint } from 'ol/geom';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { DefaultConfig } from '../config-manager/default-config';
import { getSvgWindBarb } from '../../ui-icons/get-svg-wind-barb/get-svg-wind-barb';
import { ConversionManager } from '../conversion-manager/conversion-manager';
import { FeatureProperties } from '../../ol-helpers/feature-properties';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';
import { Circle, Fill, Icon, Text, Stroke, Style } from 'ol/style';
import { flattenGeometryCoordinates } from '../../ol-helpers/flatten-geometry-coordinates';

const FILENAME = 'style-manager.js';

const DefaultDrawingStyle = new Style({
    fill: new Fill({
        color: '#D7E3FA80'
    }),
    stroke: new Stroke({
        color: '#0166A5FF',
        width: 2.5
    })
});

const DefaultMeasurementStyle = new Style({
    fill: new Fill({
        color: '#FFFFFF66'
    }),
    stroke: new Stroke({
        color: '#3B4352FF',
        lineDash: [2, 5],
        width: 2.5
    })
});

const DefaultSelectDrawingStyle = new Style({
    fill: new Fill({
        color: '#CEEEFF80'
    }),
    stroke: new Stroke({
        color: '#0080C5FF',
        width: 2.5
    })
});

const DefaultSelectMeasurementStyle = new Style({
    fill: new Fill({
        color: '#CEEEFF80'
    }),
    stroke: new Stroke({
        color: '#0080C5FF',
        lineDash: [2, 5],
        width: 2.5
    })
});

const DefaultSelectedVertices = new Style({
    image: new Circle({
        radius: 6,
        fill: new Fill({
            color: '#0080C5FF',
        }),
        stroke: new Stroke({
            color: '#FFFFFFFF',
            width: 2
        })
    }),
    geometry: (feature) => {
        return new MultiPoint(flattenGeometryCoordinates(feature.getGeometry().getCoordinates()));
    },
});

/**
 * About:
 * StyleManager
 * 
 * Description:
 * When creating Features and WindBarbs a lot of ol.style-objects are created that have the exact same properties.
 * The UI can be slow to respond to mouse-events due to heavy rendering.
 * 
 * Style can be applied to a vector-layer but i want the user to be able to set the style on individual objects.
 * 
 * A first attempt to optimize the rendering will be to have this manager to keep track of created styles 
 * using multiple keys (the recepie) and map to already existing style-objects that can be shared across many objects.
 * 
 * Note:
 * Rendering many labels is a costly operation. 
 * Especially when there are many markers or wind-barbs. 
 * Therefore, label style is not applied if the map is too zoomed out, so as not to affect movements and mouse events too much.
 */
class StyleManager extends BaseManager {
    static #styles;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#styles = new ManyKeysMap();

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
    // # Section: Internal Logic
    //--------------------------------------------------------------------
    static #getIconStyle(
        keyIcon, 
        keyRotation, 
        keyWidth, 
        keyHeight, 
        keyFill,
        keyStroke,
        iconSvg
    ) {
        const keys = [keyIcon, keyRotation, keyWidth, keyHeight, keyFill, keyStroke];
        const existing = this.#styles.get(keys);

        if(existing) {
            return existing;
        }

        const style = new Style({
            image: new Icon({
                src: `data:image/svg+xml;utf8,${iconSvg}`,
                rotation: keyRotation,
                size: [
                    keyWidth, 
                    keyHeight
                ]
            })
        });

        this.#styles.set(keys, style);

        return style;
    }

    static #getCircleStyle(
        keyRadius, 
        keyWidth, 
        keyFill, 
        keyStroke
    ) {
        const keys = [keyRadius, keyWidth, keyFill, keyStroke];
        const existing = this.#styles.get(keys);

        if(existing) {
            return existing;
        }

        const style = new Style({
            image: new Circle({
                radius: keyRadius,
                fill: new Fill({
                    color: keyFill
                }),
                stroke: new Stroke({
                    color: keyStroke,
                    width: keyWidth,
                })
            })
        });

        this.#styles.set(keys, style);

        return style;
    }

    static #getLabelStyle(
        keyLabel, 
        keyLabelOffset,
        keyLabelUseUpperCase, 
        keyLabelUseEllipsisAfter, 
        keyFont, 
        keyFill, 
        keyStroke, 
        keyStrokeWidth
    ) {
        const keys = [keyLabel, keyLabelOffset, keyLabelUseUpperCase, keyLabelUseEllipsisAfter, keyFont, keyFill, keyStroke, keyStrokeWidth];
        const existing = this.#styles.get(keys);

        if(existing) {
            return existing;
        }

        const text = keyLabelUseUpperCase 
            ? keyLabel.toUpperCase() 
            : keyLabel;

        const style = new Style({
            text: new Text({
                font: keyFont,
                text: text.ellipsis(keyLabelUseEllipsisAfter),
                placement: 'point',
                fill: new Fill({
                    color: keyFill
                }),
                stroke: new Stroke({
                    color: keyStroke,
                    width: keyStrokeWidth
                }),
                offsetY: keyLabelOffset
            })
        });

        this.#styles.set(keys, style);

        return style;
    }

    static #getIconMarkerStyle(properties, resolution) {
        const defaultIcon = 'geoPin.filled';
        const [ iconName, iconVersion ] = properties.icon.key.split('.');
        const [ defaultIconName, defaultIconVersion ] = defaultIcon.split('.');

        const path = _.has(SvgPaths, [iconName, iconVersion])
            ? SvgPaths[iconName][iconVersion]
            : SvgPaths[defaultIconName][defaultIconVersion];

        const iconSvg = getSvgIcon({
            path: path,
            width: properties.icon.width,
            height: properties.icon.width,
            fill: properties.icon.fill,
            stroke: properties.icon.stroke,
            strokeWidth: properties.icon.strokeWidth,
            shouldReplaceHashtag: properties.settings.shouldReplaceHashtag
        });
        
        const iconStyle = this.#getIconStyle(
            properties.icon.key, 
            properties.icon.rotation, 
            properties.icon.width, 
            properties.icon.height, 
            properties.icon.fill, 
            properties.icon.stroke, 
            iconSvg
        );

        const circleStyle = this.#getCircleStyle(
            properties.marker.radius, 
            properties.marker.width, 
            properties.marker.fill,
            properties.marker.stroke,
        );

        const styles = [ 
            circleStyle, 
            iconStyle
        ];
        
        if(
            DefaultConfig.marker.label.shouldRender &&
            resolution < DefaultConfig.marker.label.visibleUnderResolution
        ) {
            const labelOffset = -(14 * 2.5);
            const labelStyle = this.#getLabelStyle(
                properties.label.text,
                labelOffset,
                properties.label.useUpperCase,
                properties.label.useEllipsisAfter,
                properties.label.font,
                properties.label.fill,
                properties.label.stroke,
                properties.label.strokeWidth
            );

            styles.push(labelStyle);
        }

        return styles;
    }

    static #getWindBarbStyle(properties, resolution) {
        const iconSvg = getSvgWindBarb({
            windSpeed: properties.icon.key,
            width: properties.icon.width,
            height: properties.icon.height,
            fill: properties.icon.fill,
            stroke: properties.icon.stroke,
            strokeWidth: properties.icon.strokeWidth,
            shouldReplaceHashtag: properties.settings.shouldReplaceHashtag
        });
    
        const rotation = ConversionManager.degreesToRadians(properties.icon.rotation);
        const iconStyle = this.#getIconStyle(
            properties.icon.key, 
            rotation,
            properties.icon.width, 
            properties.icon.height, 
            properties.icon.fill, 
            properties.icon.stroke, 
            iconSvg
        );

        const styles = [
            iconStyle
        ];

        if(
            DefaultConfig.marker.label.shouldRender &&
            resolution < DefaultConfig.marker.label.visibleUnderResolution
        ) {
            const labelOffsetY = 20;
            const labelOffsetDirection = rotation >= 90 && rotation <= 270 ? -1 : 1;
            const labelOffset = labelOffsetY * labelOffsetDirection;
            
            const labelStyle = this.#getLabelStyle(
                properties.label.text,
                labelOffset,
                properties.label.useUpperCase,
                properties.label.useEllipsisAfter,
                properties.label.font,
                properties.label.fill,
                properties.label.stroke,
                properties.label.strokeWidth
            );

            styles.push(labelStyle);
        }

        return styles;
    }

    // TODO:
    // What to use as default?
    static #getDefaultStyle() {
        return undefined;
    }

    // Note:
    // Needed to duplicate the FeatureManager.getType to avoid circular dependencies
    static #getType(feature) {
        return _.get(feature.getProperties(), ['oltb', 'type'], undefined);
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static getStyle(feature, resolution) {
        const oltb = DefaultConfig.toolbar.id;
        const properties = feature.get(oltb);
        if(!properties) {
            return;
        }

        if(properties.type === FeatureProperties.type.iconMarker) {
            return this.#getIconMarkerStyle(properties, resolution);
        }

        if(properties.type === FeatureProperties.type.windBarb) {
            return this.#getWindBarbStyle(properties, resolution);
        }

        return this.#getDefaultStyle();
    }

    static clearStyles() {
        this.#styles.clear();
    }

    static getSize() {
        return this.#styles.size || 0;
    }

    static getDefaultMeasurementStyle() {
        return DefaultMeasurementStyle;
    }

    static getDefaultDrawingStyle() {
        return DefaultDrawingStyle;
    }

    static getSelectedStyle(feature, resolution) {
        const type = this.#getType(feature);
        switch(type) {
            case FeatureProperties.type.measurement:
                return this.getDefaultSelectMeasurementStyle();
            case FeatureProperties.type.drawing:
                return this.getDefaultSelectDrawingStyle();
            default:
                return this.getDefaultSelectDrawingStyle();
        }
    }

    static getDefaultSelectDrawingStyle() {
        return [DefaultSelectDrawingStyle, DefaultSelectedVertices];
    }

    static getDefaultSelectMeasurementStyle() {
        return [DefaultSelectMeasurementStyle, DefaultSelectedVertices];
    }
}

export { StyleManager };