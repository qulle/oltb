import { DOM } from '../../helpers/browser/DOM';
import { Config } from '../Config';
import { Events } from '../../helpers/constants/Events';
import { Overlay } from 'ol';
import { getCenter } from 'ol/extent';
import { trapFocus } from '../../helpers/browser/TrapFocus';
import { LogManager } from './LogManager';
import { editMarker } from './info-window-manager/EditMarker';
import { removeMarker } from './info-window-manager/RemoveMarker';
import { copyMarkerInfo } from './info-window-manager/CopyMarkerInfo';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { Fill, Stroke, Style } from 'ol/style';
import { copyMarkerCoordinates } from './info-window-manager/CopyMarkerCoordinates';

const FILENAME = 'managers/InfoWindowManager.js';
const CLASS_ANIMATION = 'oltb-animation';
const CLASS_ANIMATION_CENTERED_BOUNCE = `${CLASS_ANIMATION}--centered-bounce`;
const CLASS_INFO_WINDOW = 'oltb-info-window';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

class InfoWindowManager {
    static #map;
    static #infoWindow;
    static #overlay;
    static #title;
    static #content;
    static #footer;
    static #lastFeature;

    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
        this.#createInfoWindow();
    }

    static setMap(map) {
        this.#map = map;

        this.#map.addOverlay(this.#overlay);
        this.#map.on(Events.openLayers.singleClick, this.onSingleClick.bind(this));
        this.#map.on(Events.openLayers.pointerMove, this.onPointerMove.bind(this));
    }

    static #createInfoWindow() {
        // Create infoWindow
        this.#infoWindow = DOM.createElement({
            element: 'div',
            class: `${CLASS_INFO_WINDOW} ${CLASS_ANIMATION}`,
            attributes: {
                'tabindex': '-1'
            },
            listeners: {
                'keydown': trapFocus
            }
        });

        const header = DOM.createElement({
            element: 'div',
            class: `${CLASS_INFO_WINDOW}__header`
        });

        this.#title = DOM.createElement({
            element: 'h3',
            class: `${CLASS_INFO_WINDOW}__title`
        });

        const closeButton = DOM.createElement({
            element: 'button', 
            html: getIcon({
                path: SvgPaths.close.stroked,
                fill: 'none',
                stroke: 'currentColor'
            }),
            class: `${CLASS_INFO_WINDOW}__close oltb-btn oltb-btn--blank`,
            listeners: {
                'click': this.hideOverlay.bind(this)
            }
        });

        this.#content = DOM.createElement({
            element: 'div',
            class: `${CLASS_INFO_WINDOW}__content`
        });

        this.#footer = DOM.createElement({
            element: 'div',
            class: `${CLASS_INFO_WINDOW}__footer`
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
                Config.overlayOffset.horizontal,
                Config.overlayOffset.vertical
            ],
            autoPan: true,
            autoPanAnimation: {
                duration: Config.animationDuration.normal
            }
        });
    }

    static onSingleClick(event) {
        const feature = this.#map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return feature;
        });

        const infoWindow = feature?.getProperties()?.oltb?.infoWindow;
        if(infoWindow) {
            this.showOverlay(feature);
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

        if(infoWindow && nodeName === 'CANVAS') {
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
        });

        feature.setStyle(style);
        this.#lastFeature = feature;
    }

    static showOverlay(marker, position) {
        this.showOverlayDelayed(marker, position, 0);
    }

    static showOverlayDelayed(marker, position, delay = Config.animationDuration.normal) {
        window.setTimeout(() => {
            const infoWindow = marker.getProperties().oltb.infoWindow;
            if(!infoWindow) {
                return;
            }

            this.#title.innerHTML = infoWindow.title;
            this.#content.innerHTML = infoWindow.content;
            this.#footer.innerHTML = infoWindow.footer;

            if(position) {
                this.#overlay.setPosition(position);
            }else {
                this.#overlay.setPosition(getCenter(
                    marker.getGeometry().getExtent()
                ));
            }

            this.#infoWindow.focus();
            
            DOM.runAnimation(this.#infoWindow, CLASS_ANIMATION_CENTERED_BOUNCE);

            // Attach listeners to the function-buttons inside the infoWindow
            const uiRefRemoveMarkerButton = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-remove`);
            if(uiRefRemoveMarkerButton) {
                uiRefRemoveMarkerButton.addEventListener(
                    Events.browser.click, 
                    removeMarker.bind(this, InfoWindowManager, marker)
                );
            }

            const uiRefCopyMarkerCoordinatesButton = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-copy-coordinates`);
            if(uiRefCopyMarkerCoordinatesButton) {
                uiRefCopyMarkerCoordinatesButton.addEventListener(
                    Events.browser.click, 
                    copyMarkerCoordinates.bind(this, InfoWindowManager, uiRefCopyMarkerCoordinatesButton.getAttribute('data-oltb-coordinates'))
                );
            }

            const uiRefCopyMarkerInfoButton = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-copy-text`);
            if(uiRefCopyMarkerInfoButton) {
                uiRefCopyMarkerInfoButton.addEventListener(
                    Events.browser.click, 
                    copyMarkerInfo.bind(this, InfoWindowManager, uiRefCopyMarkerInfoButton.getAttribute('data-oltb-copy'))
                );
            }

            const uiRefEditMarkerButton = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-edit`);
            if(uiRefEditMarkerButton) {
                uiRefEditMarkerButton.addEventListener(
                    Events.browser.click, 
                    editMarker.bind(this, InfoWindowManager, marker)
                );
            }
        }, delay);
    }

    static hideOverlay() {
        DOM.clearElements([
            this.#title,
            this.#content,
            this.#footer
        ])
        
        this.#overlay.setPosition(undefined);
    }
}

export { InfoWindowManager };