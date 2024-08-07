import { DOM } from '../../browser-helpers/dom-factory';
import { Snap } from 'ol/interaction';
import { Events } from '../../browser-constants/events';
import { unByKey } from 'ol/Observable';
import { Settings } from '../../browser-constants/settings';
import { LineString } from 'ol/geom';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { LayerManager } from '../layer-manager/layer-manager';
import { SettingsManager } from '../settings-manager/settings-manager';
import { Feature, Overlay } from 'ol';

const FILENAME = 'snap-manager.js';
const CLASS__OVERLAY_SNAP = 'oltb-overlay-snap';
const STYLE__SNAPPED = 'border: 1px dashed #007C70;';
const STYLE__NOT_SNAPPED = 'border: 1px dashed #EB4542;';

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
    static #interaction;
    static #snapOverlay;
    static #onPointerMoveListener;

    static #snapCounter;
    static #moveCounter;

    static #xLine;
    static #yLine;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#interaction = this.#createInteraction();
        this.#interaction.on(Events.openLayers.snap, this.#onSnap.bind(this));

        this.#snapOverlay = this.#createSnapOverlay();

        this.#setCountersTo(0);
        this.#setLineColorTo(STYLE__NOT_SNAPPED);

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

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    static #createSnapOverlay() {
        // Note: 
        // Not a perfect solution but will work for now.
        // The problem is that the overlay follows the cursor (and that is correct) but the lines only goes to the edges of the overlay
        // Making the overlay element bigger "solves" the problem (if the user not dragging the mouse to another screen)
        const dimensionFactor = 2;
        const screenWidth = window.screen.width * dimensionFactor;
        const screenHeight = window.screen.height * dimensionFactor;

        const snapOverlayElement = DOM.createElement({
            element: 'div',
            class: CLASS__OVERLAY_SNAP,
            style: {
                'width': `${screenWidth}px`,
                'height': `${screenHeight}px`
            }
        });

        this.#xLine = DOM.createElement({
            element: 'div',
            class: `${CLASS__OVERLAY_SNAP}__x-line`
        });

        this.#yLine = DOM.createElement({
            element: 'div',
            class: `${CLASS__OVERLAY_SNAP}__y-line`,
        });

        DOM.appendChildren(snapOverlayElement, [
            this.#xLine, 
            this.#yLine
        ]);

        return new Overlay({
            stopEvent: false,
            element: snapOverlayElement,
            positioning: 'center-center',
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
        this.#snapCounter += 1;
        this.#tool.onSnap(event);
        
        // Note: 
        // The help lines should now follow the Snapped vertext and not the mouse
        this.#snapOverlay.setPosition(event.vertex);
        this.#setLineColorTo(STYLE__SNAPPED);
    }

    static #onPointerMove(event) {
        // TODO:
        // 1. Create help function
        // 2. Track all help-lines
        // 3. Remove help-lines when not needed
        // Limit on amount?, only one x and one y line?
        this.#drawHelpLines(event)

        // Note: 
        // Only follow the mouse exactly if we are not snapped
        // The onSnap sets the positon to the vertex when Snapped
        if(this.#snapCounter === 0 && this.#moveCounter === 0) {
            this.#snapOverlay.setPosition(event.coordinate);
        }
        
        // Note: 
        // A snap event must first have triggered
        if(this.#snapCounter !== 0) {
            this.#moveCounter += 1;
        }

        // Note: 
        // No snap event or is still snapped
        if(this.#snapCounter === this.#moveCounter) {
            return;
        }

        // Note: 
        // Snap is released
        this.#setCountersTo(0);
        this.#setLineColorTo(STYLE__NOT_SNAPPED);
        this.#snapOverlay.setPosition(event.coordinate);
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    static #drawHelpLines(event) {
        // TODO:
        // Optimize, only visible features, track help-lines etc.
        const trackedFeatures = LayerManager.getSnapFeatures();
        trackedFeatures.forEach((feature) => {
            const mouseCoordinates = event.coordinate;
            const featureCoordinates = feature.getGeometry().getCoordinates()[0];

            featureCoordinates.forEach((coordinates) => {
                if(
                    mouseCoordinates[0] === coordinates[0] ||
                    mouseCoordinates[1] === coordinates[1]
                ) {
                    const points = [mouseCoordinates, coordinates];
                    const helpLine = new Feature({
                        geometry: new LineString(points)
                    });

                    this.#interaction.addFeature(helpLine);
                }
            });
        });
    }

    static #setCountersTo(value) {
        this.#snapCounter = value;
        this.#moveCounter = value;
    }

    static #setLineColorTo(value) {
        this.#xLine.style = value;
        this.#yLine.style = value;
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
            this.#map.addOverlay(this.#snapOverlay);
            this.#onPointerMoveListener = this.#map.on(Events.openLayers.pointerMove, this.#onPointerMove.bind(this));
        }
    }

    static removeSnap() {
        this.#tool = undefined;
        this.#map.removeInteraction(this.#interaction);
        this.#map.removeOverlay(this.#snapOverlay);

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