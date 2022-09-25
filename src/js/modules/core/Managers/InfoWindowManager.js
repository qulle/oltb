import Overlay from 'ol/Overlay';
import CONFIG from '../Config';
import DOM from '../../helpers/Browser/DOM';
import { getCenter } from 'ol/extent';
import { SVG_PATHS, getIcon } from '../Icons';
import { copyFeatureInfo } from './InfoWindowManager/CopyFeatureInfo';
import { removeFeature } from './InfoWindowManager/RemoveFeature';
import { editFeature } from './InfoWindowManager/EditFeature';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';
import { hasNestedProperty } from '../../helpers/HasNestedProperty';
import { EVENTS } from '../../helpers/Constants/Events';

const ANIMATION_CLASS = 'oltb-animations--centered-bounce';

class InfoWindowManager {
    static map;
    static overlay;
    static content;

    static init(map) {
        if(this.map) {
            return;
        }

        this.map = map;

        // Create DOM elements
        const infoWindow = DOM.createElement({
            element: 'div',
            class: 'oltb-info-window',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'keydown': trapFocusKeyListener
            }
        });

        const closeButton = DOM.createElement({
            element: 'button', 
            html: getIcon({
                path: SVG_PATHS.Close,
                fill: 'none',
                stroke: 'currentColor'
            }),
            class: 'oltb-info-window__close oltb-btn oltb-btn--blank',
            listeners: {
                'click': this.hideOverlay.bind(this)
            }
        });

        const content = DOM.createElement({
            element: 'div',
            class: 'oltb-info-window__content'
        });

        this.infoWindow = infoWindow;
        this.content = content;

        infoWindow.appendChild(closeButton);
        infoWindow.appendChild(content);

        // Create ol overlay
        this.overlay = new Overlay({
            element: infoWindow,
            autoPan: true,
            autoPanAnimation: {
                duration: CONFIG.animationDuration
            }
        });

        this.map.addOverlay(this.overlay);
        this.map.on(EVENTS.Ol.SingleClick, this.onSingleClick.bind(this));
        this.map.on(EVENTS.Ol.PointerMove, this.onPointerMove.bind(this));
    }

    static onSingleClick(event) {
        const feature = this.map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return feature;
        });

        const infoWindow = feature?.getProperties()?.infoWindow;
        
        if(infoWindow) {
            this.content.innerHTML = infoWindow;
            this.overlay.setPosition(getCenter(
                feature.getGeometry().getExtent()
            ));

            // Trigger reflow of DOM, reruns animation when class is added back
            this.infoWindow.classList.remove(ANIMATION_CLASS);
            void this.infoWindow.offsetWidth;
            this.infoWindow.classList.add(ANIMATION_CLASS);

            const removeFeatureButton = this.content.querySelector('#oltb-info-window-remove-marker');
            if(removeFeatureButton) {
                removeFeatureButton.addEventListener(EVENTS.Browser.Click, removeFeature.bind(this, feature));
            }

            const copyFeatureInfoButton = this.content.querySelector('#oltb-info-window-copy-marker-location');
            if(copyFeatureInfoButton) {
                copyFeatureInfoButton.addEventListener(EVENTS.Browser.Click, copyFeatureInfo.bind(this, copyFeatureInfoButton.getAttribute('data-copy')));
            }

            const editFeatureButton = this.content.querySelector('#oltb-info-window-edit-marker');
            if(editFeatureButton) {
                editFeatureButton.addEventListener(EVENTS.Browser.Click, editFeature.bind(this, feature));
            }
        }else {
            this.hideOverlay();
        }
    }

    static onPointerMove(event) {
        const hit = this.map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return hasNestedProperty(feature.getProperties(), 'infoWindow');
        });

        this.map.getViewport().style.cursor = hit ? 'pointer' : 'default';
    }

    static hideOverlay() {
        this.content.innerHTML = '';
        this.overlay.setPosition(undefined);
    }
}

export default InfoWindowManager;