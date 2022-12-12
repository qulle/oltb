import DOM from '../../helpers/Browser/DOM';
import CONFIG from '../Config';
import Overlay from 'ol/Overlay';
import { EVENTS } from '../../helpers/Constants/Events';
import { getCenter } from 'ol/extent';
import { editFeature } from './info-window-manager/EditFeature';
import { removeFeature } from './info-window-manager/RemoveFeature';
import { copyFeatureInfo } from './info-window-manager/CopyFeatureInfo';
import { SVG_PATHS, getIcon } from '../icons/SVGIcons';
import { Fill, Stroke, Style } from 'ol/style';
import { trapFocusKeyListener } from '../../helpers/browser/TrapFocus';

const ANIMATION_CLASS = 'oltb-animation--centered-bounce';
const ID_PREFIX = 'oltb-info-window-marker';

class InfoWindowManager {
    static #map;
    static #overlay;
    static #content;
    static #lastFeature;

    static init(map) {
        if(this.#map) {
            return;
        }

        this.#map = map;

        // Create DOM element representing infoWindow
        this.infoWindow = DOM.createElement({
            element: 'div',
            class: 'oltb-info-window oltb-animation',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'keydown': trapFocusKeyListener
            }
        });

        this.#content = DOM.createElement({
            element: 'div',
            class: 'oltb-info-window__content'
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

        this.infoWindow.appendChild(closeButton);
        this.infoWindow.appendChild(this.#content);

        // Create ol overlay to host infoWindow
        this.#overlay = new Overlay({
            element: this.infoWindow,
            positioning: 'bottom-center',
            offset: [
                CONFIG.overlayOffset.horizontal,
                CONFIG.overlayOffset.vertical
            ],
            autoPan: true,
            autoPanAnimation: {
                duration: CONFIG.animationDuration.normal
            }
        });

        this.#map.addOverlay(this.#overlay);
        this.#map.on(EVENTS.Ol.SingleClick, this.onSingleClick.bind(this));
        this.#map.on(EVENTS.Ol.PointerMove, this.onPointerMove.bind(this));
    }

    static onSingleClick(event) {
        const feature = this.#map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return feature;
        });

        const infoWindow = feature?.getProperties()?.oltb?.infoWindow;
        
        if(infoWindow) {
            this.showOverly(feature);
        }else {
            this.hideOverlay();
        }
    }

    static onPointerMove(event) {
        const feature = this.#map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return feature;
        });

        if(this.#lastFeature && (!feature || this.#lastFeature !== feature)) {
            this.#lastFeature.setStyle(null);
        }

        const hightlight = feature?.getProperties()?.oltb?.highlightOnHover;

        if(hightlight) {
            this.hightlightVectorSection(feature);
        }

        const infoWindow = feature?.getProperties()?.oltb?.infoWindow;

        if(infoWindow) {
            this.#map.getViewport().style.cursor = 'pointer';
        }else {
            this.#map.getViewport().style.cursor = 'default';
        }
    }

    static hightlightVectorSection(feature) {
        const style = new Style({
            fill: new Fill({color: '#254372AA'}),
            stroke: new Stroke({
                color: '#369ACDFF',
                width: 1.5
            })
        })

        feature.setStyle(style);
        this.#lastFeature = feature;
    }

    static showOverly(feature, position) {
        const infoWindow = feature.getProperties().oltb.infoWindow;

        this.#content.innerHTML = infoWindow;

        if(position) {
            this.#overlay.setPosition(position);
        }else {
            this.#overlay.setPosition(getCenter(
                feature.getGeometry().getExtent()
            ));
        }

        DOM.runAnimation(this.infoWindow, ANIMATION_CLASS);

        const removeFeatureButton = this.#content.querySelector(`#${ID_PREFIX}-remove`);
        if(removeFeatureButton) {
            removeFeatureButton.addEventListener(EVENTS.Browser.Click, removeFeature.bind(this, InfoWindowManager, feature));
        }

        const copyFeatureInfoButton = this.#content.querySelector(`#${ID_PREFIX}-copy-location`);
        if(copyFeatureInfoButton) {
            copyFeatureInfoButton.addEventListener(EVENTS.Browser.Click, copyFeatureInfo.bind(this, InfoWindowManager, copyFeatureInfoButton.getAttribute('data-copy')));
        }

        const editFeatureButton = this.#content.querySelector(`#${ID_PREFIX}-edit`);
        if(editFeatureButton) {
            editFeatureButton.addEventListener(EVENTS.Browser.Click, editFeature.bind(this, InfoWindowManager, feature));
        }
    }

    static hideOverlay() {
        this.#content.innerHTML = '';
        this.#overlay.setPosition(undefined);
    }
}

export default InfoWindowManager;