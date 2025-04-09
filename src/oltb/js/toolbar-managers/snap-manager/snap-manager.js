import _ from 'lodash';
import { Snap } from 'ol/interaction';
import { Events } from '../../browser-constants/events';
import { Feature } from 'ol';
import { unByKey } from 'ol/Observable';
import { Settings } from '../../browser-constants/settings';
import { LineString } from 'ol/geom';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { LayerManager } from '../layer-manager/layer-manager';
import { Stroke, Style } from 'ol/style';
import { SettingsManager } from '../settings-manager/settings-manager';
import { FeatureProperties } from '../../ol-helpers/feature-properties';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { flattenGeometryCoordinates } from '../../ol-helpers/flatten-geometry-coordinates';

const FILENAME = 'snap-manager.js';
const PIXEL__TOLERANCE = 10;
const ZINDEX__SNAP_LINES_LAYER = 1e9;

const STYLE__SNAP_LINE_COLOR = '#EB4542FF';
const STYLE__SNAP_LINE_DASH = Object.freeze([2, 5]);
const STYLE__SNAP_LINE_WIDTH = 2.0;

/**
 * About:
 * SnapManager
 * 
 * Description:
 * Manages the Snap interaction. 
 * The Snap interaction can be requested by any tool that uses a Draw function such as the Draw-, Measure- and Scissors tool.
 */
class SnapManager extends BaseManager {
    static #map;
    static #tool;
    static #snapLines;
    static #interaction;
    static #onPointerMoveListener;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#snapLines = this.#createSnapLayer();
        this.#interaction = this.#createInteraction();
        this.#interaction.on(Events.openLayers.snap, this.#onSnap.bind(this));
        this.#interaction.on(Events.openLayers.unSnap, this.#onUnSnap.bind(this));

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) {
        this.#map = map;
    }

    static getName() {
        return FILENAME;
    }

    static #createSnapLayer() {
        return new VectorLayer({
            zIndex: ZINDEX__SNAP_LINES_LAYER,
            source: new VectorSource(),
            style: new Style({
                stroke: new Stroke({
                    color: STYLE__SNAP_LINE_COLOR,
                    lineDash: STYLE__SNAP_LINE_DASH,
                    width: STYLE__SNAP_LINE_WIDTH
                })
            })
        });
    }

    static #createInteraction() {
        const features = LayerManager.getSnapFeatures();
        
        return new Snap({
            features: features,
            pixelTolerance: PIXEL__TOLERANCE,
            edge: true,
            vertex: true,
            intersection: true
        });
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    static #onSnap(event) {
        if(!this.isSnapLine(event.feature)) {
            this.#tool.onSnap(event);
        }
    }

    static #onUnSnap(event) {
        if(!this.isSnapLine(event.feature)) {
            this.#tool.onUnSnap(event);
        }
    }

    static #onPointerMove(event) {
        this.#handleSnapLines(event);
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    static #isSnapEnabled() {
        return SettingsManager.getSetting(Settings.snapInteraction);
    }

    static #useSnapHelpLines() {
        return SettingsManager.getSetting(Settings.snapHelpLines);
    }

    static #getStraightLinePoint(mouseCoordinate, featureCoordinate, tolerance) {
        const [mX, mY] = mouseCoordinate;
        const [fX, fY] = featureCoordinate;
    
        const isNearVertical = Math.abs(mX - fX) <= tolerance;
        const isNearHorizontal = Math.abs(mY - fY) <= tolerance;
    
        if(isNearHorizontal) {
            return [mX, fY];
        }
        
        if(isNearVertical) {
            return [fX, mY];
        }

        return null;
    }

    static #handleSnapLines(event) {
        // TODO:
        // Don't use snap-lines if the mouse has snapped to a feature segment or vertext
        const mouseCoordinates = event.coordinate;
        const trackedFeatures = LayerManager.getSnapFeatures();
        const tolerance = this.#map.getView().getResolution() * PIXEL__TOLERANCE;
        
        // Note:
        // Remove old snapLines that are not relevant anymore
        this.#cleanSnapLines();

        // Note:
        // Find new vertices that are close to the current mouse location
        const snapSource = this.#snapLines.getSource();
        const snapLinesBuffer = [];
        trackedFeatures.forEach((feature) => {
            flattenGeometryCoordinates(
                feature.getGeometry().getCoordinates()
            ).forEach((coordinates) => {
                const nearestPoint = this.#getStraightLinePoint(mouseCoordinates, coordinates, tolerance);
                if(nearestPoint) {
                    const snapLine = new Feature({
                        geometry: new LineString([coordinates, nearestPoint]),
                        oltb: {
                            type: FeatureProperties.type.snapLine
                        }
                    });

                    snapLinesBuffer.push(snapLine);
                }
            });
        });

        snapLinesBuffer.forEach((snapLine) => {
            snapSource.addFeature(snapLine);
            this.#interaction.addFeature(snapLine);
        });
    }

    static #cleanSnapLines() {
        const snapSource = this.#snapLines.getSource();
        const snapLines = snapSource.getFeatures();

        snapLines.forEach((snapLine) => {
            this.#interaction.removeFeature(snapLine);
        });

        snapSource.clear();
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static isSnapLine(feature) {
        return _.get(feature.getProperties(), ['oltb', 'type'], undefined) === FeatureProperties.type.snapLine;
    }
    
    static addSnap(tool) {
        const isEnabled = this.#isSnapEnabled();
        const useSnapHelpLines = this.#useSnapHelpLines();

        LogManager.logDebug(FILENAME, 'addSnap', {
            info: 'Snap interaction requested',
            isEnabled: isEnabled,
            useSnapHelpLines: useSnapHelpLines,
            requestedBy: tool.getName()
        });

        if(!isEnabled) {
            return;
        }

        this.#tool = tool;
        this.#map.addInteraction(this.#interaction);

        if(this.#useSnapHelpLines()) {
            this.#map.addLayer(this.#snapLines);
            this.#onPointerMoveListener = this.#map.on(Events.openLayers.pointerMove, this.#onPointerMove.bind(this));
        }
    }

    static removeSnap() {
        this.#tool = undefined;
        this.#map.removeLayer(this.#snapLines);
        this.#map.removeInteraction(this.#interaction);

        this.#cleanSnapLines();
        unByKey(this.#onPointerMoveListener);
    }

    static getActivatedBy() {
        return this.#tool;
    }

    static hasActiveTool() {
        return !!this.getActivatedBy();
    }

    static getInteraction() {
        return this.#interaction;
    }
}

export { SnapManager };