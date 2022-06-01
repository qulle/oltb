import Overlay from 'ol/Overlay';
import Config from '../Config';
import DOM from '../../helpers/Browser/DOM';
import { getCenter } from 'ol/extent';
import { SVGPaths, getIcon } from '../Icons';
import { copyFeatureInfo } from './InfoWindowManager/CopyFeatureInfo';
import { removeFeature } from './InfoWindowManager/RemoveFeature';
import { editFeature } from './InfoWindowManager/EditFeature';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';

const animationClass = 'oltb-animations--centered-bounce';

class InfoWindowManager {
    static map;
    static overlay;
    static content;

    static init(mapReference) {
        if(this.map) {
            return;
        }

        this.map = mapReference;

        // Create DOM elements
        const infoWindow = DOM.createElement({element: 'div',
            attributes: {
                class: 'oltb-info-window'
            }
        });

        infoWindow.setAttribute('tabindex', -1);
        infoWindow.addEventListener('keydown', trapFocusKeyListener);

        const closeButton = DOM.createElement({element: 'button', 
            html: getIcon({
                path: SVGPaths.Close,
                fill: 'none',
                stroke: 'currentColor'
            }),
            attributes: {
                class: 'oltb-info-window__close oltb-btn oltb-btn--blank'
            }
        });

        closeButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.hideOverlay();
        });

        const content = DOM.createElement({element: 'div',
            attributes: {
                class: 'oltb-info-window__content'
            }
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

        const infoWindow = feature?.attributes?.infoWindow;
        if(infoWindow) {
            this.content.innerHTML = infoWindow;
            this.overlay.setPosition(getCenter(
                feature.getGeometry().getExtent()
            ));

            this.infoWindow.classList.remove(animationClass);

            // Trigger reflow of DOM, reruns animation when class is added back
            void this.infoWindow.offsetWidth;

            this.infoWindow.classList.add(animationClass);

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
            return 'attributes' in feature && 'infoWindow' in feature.attributes;
        });

        this.map.getViewport().style.cursor = hit ? 'pointer' : 'default';
    }

    static hideOverlay() {
        this.content.innerHTML = '';
        this.overlay.setPosition(undefined);
    }
}

export default InfoWindowManager;