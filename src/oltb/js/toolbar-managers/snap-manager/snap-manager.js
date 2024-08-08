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
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { flattenGeometryCoordinates } from '../../ol-helpers/flatten-geometry-coordinates';

const FILENAME = 'snap-manager.js';

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
    static #helpLinesLayer;
    static #interaction;
    static #onPointerMoveListener;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#helpLinesLayer = this.#createHelpLinesLayer();
        this.#interaction = this.#createInteraction();
        this.#interaction.on(Events.openLayers.snap, this.#onSnap.bind(this));

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

    static #createHelpLinesLayer() {
        return new VectorLayer({
            zIndex: 1000000000,
            source: new VectorSource(),
            style: new Style({
                stroke: new Stroke({
                    color: '#EB4542FF',
                    lineDash: [2, 5],
                    width: 2.5
                })
            })
        });
    }

    static #createInteraction() {
        const features = LayerManager.getSnapFeatures();
        
        return new Snap({
            features: features,
            pixelTolerance: 10,
                edge: true,
            vertex: true
        });
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    static #onSnap(event) {
        this.#tool.onSnap(event);
    }

    static #onPointerMove(event) {
        this.#drawHelpLines(event);
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    static #drawHelpLines(event) {
        // TODO:
        // Doing tests with tracking pointer, comparing it to known points and drawing help-lines so the mouse can snap to the help line
        // 1. Fetch only features that are visible in view
        // 2. How to know when to remove a line that is not used?
        // 3. Optimize methods that are used each cycle
        // 4. Smarter tracking of drawn features, needs to be removed from two collections, layer + snapp-interaction

        // const helpLines = this.#helpLinesLayer.getSource().getFeatures();
        // helpLines.forEach((helpLine) => {
        //     this.#interaction.removeFeature(helpLine);
        // });

        // this.#helpLinesLayer.getSource().clear();

        const trackedFeatures = LayerManager.getSnapFeatures();
        trackedFeatures.forEach((feature) => {
            const mouseCoordinates = event.coordinate;
            const featureCoordinates = flattenGeometryCoordinates(feature.getGeometry().getCoordinates());

            featureCoordinates.forEach((coordinates) => {
                if(
                    mouseCoordinates[0] === coordinates[0] ||
                    mouseCoordinates[1] === coordinates[1]
                ) {
                    const points = [mouseCoordinates, coordinates];
                    const helpLine = new Feature({
                        geometry: new LineString(points),
                    });

                    this.#helpLinesLayer.getSource().addFeature(helpLine);
                    this.#interaction.addFeature(helpLine);
                }
            });
        });
    }

    static #isSnapEnabled() {
        return SettingsManager.getSetting(Settings.snapInteraction);
    }

    static #useSnapHelpLines() {
        return SettingsManager.getSetting(Settings.snapHelpLines);
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
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
            this.#map.addLayer(this.#helpLinesLayer);
            this.#onPointerMoveListener = this.#map.on(Events.openLayers.pointerMove, this.#onPointerMove.bind(this));
        }
    }

    static removeSnap() {
        this.#tool = undefined;
        this.#map.removeLayer(this.#helpLinesLayer);
        this.#map.removeInteraction(this.#interaction);

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