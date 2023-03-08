import { DOM } from "../../helpers/browser/DOM";
import { CONFIG } from "../Config";
import { EVENTS } from '../../helpers/constants/Events';
import { Overlay } from 'ol';
import { unByKey } from 'ol/Observable';
import { LogManager } from "./LogManager";

const FILENAME = 'managers/TooltipManager.js';

class TooltipManager {
    static #map;
    static #tooltipOverlay;
    static #tooltips = {}

    static init(map) {
        if(Boolean(this.#map)) {
            return;
        }

        LogManager.logDebug(FILENAME, 'init', 'Initializing started');

        this.#map = map;

        const tooltipElement = DOM.createElement({
            element: 'div',
            class: 'oltb-overlay-tooltip'
        });

        this.#tooltipOverlay = new Overlay({
            stopEvent: false,
            element: tooltipElement,
            positioning: 'bottom-center',
            offset: [
                CONFIG.OverlayOffset.Horizontal,
                CONFIG.OverlayOffset.Vertical
            ]
        });
    }

    static isEmpty() {
        return Object.keys(this.#tooltips).length === 0;
    }

    static push(key) {
        const tooltipItemElement = DOM.createElement({
            element: 'span',
            class: 'oltb-overlay-tooltip__item'
        });

        if(this.isEmpty()) {
            this.#map.addOverlay(this.#tooltipOverlay);
            this.onPointerMoveListener = this.#map.on(EVENTS.OpenLayers.PointerMove, this.onPointerMove.bind(this));
        }

        this.#tooltips[key] = tooltipItemElement;
        this.#tooltipOverlay.getElement().prepend(tooltipItemElement);

        return tooltipItemElement;
    }

    static pop(key) {
        const tooltipItemElement = this.#tooltips[key];

        delete this.#tooltips[key];
        this.#tooltipOverlay.getElement().removeChild(tooltipItemElement);

        if(this.isEmpty()) {
            unByKey(this.onPointerMoveListener);
            this.#map.removeOverlay(this.#tooltipOverlay);
            this.#tooltipOverlay.setPosition(null);
        }

        return tooltipItemElement;
    }

    static onPointerMove(event) {
        this.#tooltipOverlay.setPosition(event.coordinate);
    }
}

export { TooltipManager };