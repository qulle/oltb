import { DOM } from '../../helpers/browser/DOM';
import { CONFIG } from '../Config';
import { EVENTS } from '../../helpers/constants/Events';
import { Overlay } from 'ol';
import { getCenter } from 'ol/extent';
import { editFeature } from './info-window-manager/EditFeature';
import { removeFeature } from './info-window-manager/RemoveFeature';
import { copyFeatureInfo } from './info-window-manager/CopyFeatureInfo';
import { SVG_PATHS, getIcon } from '../icons/GetIcon';
import { Fill, Stroke, Style } from 'ol/style';
import { trapFocusKeyListener } from '../../helpers/browser/TrapFocus';
import { copyFeatureCoordinates } from './info-window-manager/CopyFeatureCoordinates';

const ANIMATION_CLASS = 'oltb-animation--centered-bounce';
const ID_PREFIX = 'oltb-info-window-marker';

class InfoWindowManager {
    static #map;
    static #infoWindow;
    static #overlay;
    static #title;
    static #content;
    static #footer;
    static #lastFeature;

    static init(map) {
        if(this.#map) {
            return;
        }

        this.#map = map;

        // Create infoWindow
        this.#infoWindow = DOM.createElement({
            element: 'div',
            class: 'oltb-info-window oltb-animation',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'keydown': trapFocusKeyListener
            }
        });

        const header = DOM.createElement({
            element: 'div',
            class: 'oltb-info-window__header'
        });

        this.#title = DOM.createElement({
            element: 'h3',
            class: 'oltb-info-window__title'
        });

        const closeButton = DOM.createElement({
            element: 'button', 
            html: getIcon({
                path: SVG_PATHS.Close.Stroked,
                fill: 'none',
                stroke: 'currentColor'
            }),
            class: 'oltb-info-window__close oltb-btn oltb-btn--blank',
            listeners: {
                'click': this.hideOverlay.bind(this)
            }
        });

        this.#content = DOM.createElement({
            element: 'div',
            class: 'oltb-info-window__content'
        });

        this.#footer = DOM.createElement({
            element: 'div',
            class: 'oltb-info-window__footer'
        });

        DOM.appendChildren(header, [
            this.#title,
            closeButton
        ]);

        DOM.appendChildren(this.#infoWindow, [
            header, 
            this.#content,
            this.#footer
        ]);

        // Create ol overlay to host infoWindow
        this.#overlay = new Overlay({
            element: this.#infoWindow,
            positioning: 'bottom-center',
            offset: [
                CONFIG.OverlayOffset.Horizontal,
                CONFIG.OverlayOffset.Vertical
            ],
            autoPan: true,
            autoPanAnimation: {
                duration: CONFIG.AnimationDuration.Normal
            }
        });

        this.#map.addOverlay(this.#overlay);
        this.#map.on(EVENTS.OpenLayers.SingleClick, this.onSingleClick.bind(this));
        this.#map.on(EVENTS.OpenLayers.PointerMove, this.onPointerMove.bind(this));
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
        const nodeName = event.originalEvent.target.nodeName;

        if(
            infoWindow && 
            nodeName === 'CANVAS'
        ) {
            this.#map.getViewport().style.cursor = 'pointer';
        }else {
            this.#map.getViewport().style.cursor = 'default';
        }
    }

    static hightlightVectorSection(feature) {
        const style = new Style({
            fill: new Fill({
                color: '#254372AA'
            }),
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

        this.#title.innerHTML = infoWindow.title;
        this.#content.innerHTML = infoWindow.content;
        this.#footer.innerHTML = infoWindow.footer;

        if(position) {
            this.#overlay.setPosition(position);
        }else {
            this.#overlay.setPosition(getCenter(
                feature.getGeometry().getExtent()
            ));
        }

        this.#infoWindow.focus();
        
        DOM.runAnimation(this.#infoWindow, ANIMATION_CLASS);

        // Attach listeners to the function-buttons inside the infoWindow
        const removeFeatureButton = this.#footer.querySelector(`#${ID_PREFIX}-remove`);
        if(removeFeatureButton) {
            removeFeatureButton.addEventListener(
                EVENTS.Browser.Click, 
                removeFeature.bind(this, InfoWindowManager, feature)
            );
        }

        const copyFeatureCoordinatesButton = this.#footer.querySelector(`#${ID_PREFIX}-copy-coordinates`);
        if(copyFeatureCoordinatesButton) {
            copyFeatureCoordinatesButton.addEventListener(
                EVENTS.Browser.Click, 
                copyFeatureCoordinates.bind(this, InfoWindowManager, copyFeatureCoordinatesButton.getAttribute('data-coordinates'))
            );
        }

        const copyFeatureInfoButton = this.#footer.querySelector(`#${ID_PREFIX}-copy-text`);
        if(copyFeatureInfoButton) {
            copyFeatureInfoButton.addEventListener(
                EVENTS.Browser.Click, 
                copyFeatureInfo.bind(this, InfoWindowManager, copyFeatureInfoButton.getAttribute('data-copy'))
            );
        }

        const editFeatureButton = this.#footer.querySelector(`#${ID_PREFIX}-edit`);
        if(editFeatureButton) {
            editFeatureButton.addEventListener(
                EVENTS.Browser.Click, 
                editFeature.bind(this, InfoWindowManager, feature)
            );
        }
    }

    static hideOverlay() {
        this.#title.innerHTML = '';
        this.#content.innerHTML = '';
        this.#footer.innerHTML = '';
        
        this.#overlay.setPosition(undefined);
    }
}

export { InfoWindowManager };