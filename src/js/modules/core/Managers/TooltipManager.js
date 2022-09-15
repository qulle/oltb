import Overlay from 'ol/Overlay';
import DOM from "../../helpers/Browser/DOM";
import { unByKey } from 'ol/Observable';

class TooltipManager {
    static map;
    static tooltipElement;
    static tooltipOverlay;
    static tooltips = {}

    static init(map) {
        if(this.map) {
            return;
        }

        this.map = map;

        const tooltipElement = DOM.createElement({
            element: 'div',
            class: 'oltb-overlay-tooltip'
        });

        this.tooltipOverlay = new Overlay({
            stopEvent: false,
            element: tooltipElement,
            offset: [0, -6],
            positioning: 'bottom-center'
        });
    }

    static isEmpty() {
        return Object.keys(this.tooltips).length === 0;
    }

    static push(key) {
        const tooltipItemElement = DOM.createElement({
            element: 'span',
            class: 'oltb-overlay-tooltip__item'
        });

        if(this.isEmpty()) {
            this.map.addOverlay(this.tooltipOverlay);
            this.onPointerMoveListener = this.map.on('pointermove', this.onPointerMove.bind(this));
        }

        this.tooltips[key] = tooltipItemElement;
        this.tooltipOverlay.getElement().prepend(tooltipItemElement);

        return tooltipItemElement;
    }

    static pop(key) {
        const tooltipItemElement = this.tooltips[key];

        delete this.tooltips[key];
        this.tooltipOverlay.getElement().removeChild(tooltipItemElement);

        if(this.isEmpty()) {
            unByKey(this.onPointerMoveListener);
            this.map.removeOverlay(this.tooltipOverlay);
            this.tooltipOverlay.setPosition(null);
        }

        return tooltipItemElement;
    }

    static onPointerMove(event) {
        this.tooltipOverlay.setPosition(event.coordinate);
    }
}

export default TooltipManager;