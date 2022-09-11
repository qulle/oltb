import Overlay from 'ol/Overlay';
import Config from '../Config';
import DOM from '../../helpers/Browser/DOM';
import { getCenter } from 'ol/extent';
import { SVGPaths, getIcon } from '../Icons';
import { copyFeatureInfo } from './InfoWindowManager/CopyFeatureInfo';
import { removeFeature } from './InfoWindowManager/RemoveFeature';
import { editFeature } from './InfoWindowManager/EditFeature';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';
import { hasNestedProperty } from '../../helpers/HasNestedProperty';

const ANIMATION_CLASS = 'oltb-animations--centered-bounce';

class InfoWindowManager {
    static map;
    static overlay;
    static content;

    static init(map) {
        if(this.map !== undefined) {
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
                path: SVGPaths.Close,
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
                duration: Config.animationDuration
            }
        });

        this.map.addOverlay(this.overlay);
        this.map.on('singleclick', this.onSingleClick.bind(this));
        this.map.on('pointermove', this.onPointerMove.bind(this));
    }

    static onSingleClick(event) {
        const feature = this.map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return feature;
        });

        const infoWindow = feature?.properties?.infoWindow;
        
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
                removeFeatureButton.addEventListener('click', removeFeature.bind(this, feature));
            }

            const copyFeatureInfoButton = this.content.querySelector('#oltb-info-window-copy-marker-location');
            if(copyFeatureInfoButton) {
                copyFeatureInfoButton.addEventListener('click', copyFeatureInfo.bind(this, copyFeatureInfoButton.getAttribute('data-copy')));
            }

            const editFeatureButton = this.content.querySelector('#oltb-info-window-edit-marker');
            if(editFeatureButton) {
                editFeatureButton.addEventListener('click', editFeature.bind(this, feature));
            }
        }else {
            this.hideOverlay();
        }
    }

    static onPointerMove(event) {
        const hit = this.map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return hasNestedProperty(feature, 'properties', 'infoWindow');
        });

        this.map.getViewport().style.cursor = hit ? 'pointer' : 'default';
    }

    static hideOverlay() {
        this.content.innerHTML = '';
        this.overlay.setPosition(undefined);
    }
}

export default InfoWindowManager;