import { DOM } from '../../helpers/browser/DOM';
import { Snap } from 'ol/interaction';
import { Events } from '../../helpers/constants/Events';
import { Overlay } from 'ol';
import { unByKey } from 'ol/Observable';
import { Settings } from '../../helpers/constants/Settings';
import { LogManager } from './LogManager';
import { LayerManager } from './LayerManager';
import { SettingsManager } from './SettingsManager';

const FILENAME = 'managers/SnapManager.js';
const CLASS_OVERLAY_SNAP = 'oltb-overlay-snap';
const STYLE_SNAPPED = 'border: 1px dashed #007C70;';
const STYLE_NOT_SNAPPED = 'border: 1px dashed #EB4542;';

/**
 * About:
 * SnapManager
 * 
 * Description:
 * Manages the Snap interaction. 
 * The Snap interaction can be requested by any tool that uses a Draw function such as the Draw-, Measure- and Scissors tool.
 */
class SnapManager {
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
        this.#setLineColorTo(STYLE_NOT_SNAPPED);

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
            class: CLASS_OVERLAY_SNAP,
            style: `width: ${screenWidth}px; height: ${screenHeight}px;`
        });

        this.#xLine = DOM.createElement({
            element: 'div',
            class: `${CLASS_OVERLAY_SNAP}__x-line`
        });

        this.#yLine = DOM.createElement({
            element: 'div',
            class: `${CLASS_OVERLAY_SNAP}__y-line`,
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
        this.#setLineColorTo(STYLE_SNAPPED);
    }

    static #onPointerMove(event) {
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
        this.#setLineColorTo(STYLE_NOT_SNAPPED);
        this.#snapOverlay.setPosition(event.coordinate);
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
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
}

export { SnapManager };