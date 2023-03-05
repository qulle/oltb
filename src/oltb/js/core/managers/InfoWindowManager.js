import { DOM } from '../../helpers/browser/DOM';
import { CONFIG } from '../Config';
import { EVENTS } from '../../helpers/constants/Events';
import { Overlay } from 'ol';
import { getCenter } from 'ol/extent';
import { editMarker } from './info-window-manager/EditMarker';
import { removeMarker } from './info-window-manager/RemoveMarker';
import { copyMarkerInfo } from './info-window-manager/CopyMarkerInfo';
import { SVG_PATHS, getIcon } from '../icons/GetIcon';
import { Fill, Stroke, Style } from 'ol/style';
import { trapFocusKeyListener } from '../../helpers/browser/TrapFocus';
import { copyMarkerCoordinates } from './info-window-manager/CopyMarkerCoordinates';

const FILENAME = 'managers/InfoWindowManager.js';
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
        if(Boolean(this.#map)) {
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
        if(Boolean(infoWindow)) {
            this.showOverly(feature);
        }else {
            this.hideOverlay();
        }
    }

    static onPointerMove(event) {
        const feature = this.#map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return feature;
        });

        if(this.#lastFeature && (Boolean(!feature) || this.#lastFeature !== feature)) {
            this.#lastFeature.setStyle(null);
        }

        const hightlight = feature?.getProperties()?.oltb?.highlightOnHover;
        if(Boolean(hightlight)) {
            this.hightlightVectorSection(feature);
        }

        const infoWindow = feature?.getProperties()?.oltb?.infoWindow;
        const nodeName = event.originalEvent.target.nodeName;
        if(
            Boolean(infoWindow) && 
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

    static showOverly(marker, position) {
        const infoWindow = marker.getProperties().oltb.infoWindow;
        if(!Boolean(infoWindow)) {
            return;
        }

        this.#title.innerHTML = infoWindow.title;
        this.#content.innerHTML = infoWindow.content;
        this.#footer.innerHTML = infoWindow.footer;

        if(Boolean(position)) {
            this.#overlay.setPosition(position);
        }else {
            this.#overlay.setPosition(getCenter(
                marker.getGeometry().getExtent()
            ));
        }

        this.#infoWindow.focus();
        
        DOM.runAnimation(this.#infoWindow, ANIMATION_CLASS);

        // Attach listeners to the function-buttons inside the infoWindow
        const removeMarkerButton = this.#footer.querySelector(`#${ID_PREFIX}-remove`);
        if(Boolean(removeMarkerButton)) {
            removeMarkerButton.addEventListener(
                EVENTS.Browser.Click, 
                removeMarker.bind(this, InfoWindowManager, marker)
            );
        }

        const copyMarkerCoordinatesButton = this.#footer.querySelector(`#${ID_PREFIX}-copy-coordinates`);
        if(Boolean(copyMarkerCoordinatesButton)) {
            copyMarkerCoordinatesButton.addEventListener(
                EVENTS.Browser.Click, 
                copyMarkerCoordinates.bind(this, InfoWindowManager, copyMarkerCoordinatesButton.getAttribute('data-coordinates'))
            );
        }

        const copyMarkerInfoButton = this.#footer.querySelector(`#${ID_PREFIX}-copy-text`);
        if(Boolean(copyMarkerInfoButton)) {
            copyMarkerInfoButton.addEventListener(
                EVENTS.Browser.Click, 
                copyMarkerInfo.bind(this, InfoWindowManager, copyMarkerInfoButton.getAttribute('data-copy'))
            );
        }

        const editMarkerButton = this.#footer.querySelector(`#${ID_PREFIX}-edit`);
        if(Boolean(editMarkerButton)) {
            editMarkerButton.addEventListener(
                EVENTS.Browser.Click, 
                editMarker.bind(this, InfoWindowManager, marker)
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