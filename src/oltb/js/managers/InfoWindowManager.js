import { DOM } from '../helpers/browser/DOM';
import { Events } from '../helpers/constants/Events';
import { getUid } from 'ol/util';
import { Overlay } from 'ol';
import { easeOut } from 'ol/easing.js';
import { unByKey } from 'ol/Observable';
import { getCenter } from 'ol/extent';
import { trapFocus } from '../helpers/browser/TrapFocus';
import { LogManager } from './LogManager';
import { editMarker } from './info-window-manager/EditMarker';
import { LayerManager } from './LayerManager';
import { removeMarker } from './info-window-manager/RemoveMarker';
import { ConfigManager } from './ConfigManager';
import { copyMarkerInfo } from './info-window-manager/CopyMarkerInfo';
import { showMarkerLayer } from './info-window-manager/ShowMarkerLayer';
import { getVectorContext } from 'ol/render';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { HexTransparencies } from '../helpers/constants/HexTransparencies';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { copyMarkerCoordinates } from './info-window-manager/CopyMarkerCoordinates';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';

const FILENAME = 'managers/InfoWindowManager.js';
const CLASS_ANIMATION = 'oltb-animation';
const CLASS_ANIMATION_CENTERED_BOUNCE = `${CLASS_ANIMATION}--centered-bounce`;
const CLASS_INFO_WINDOW = 'oltb-info-window';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

/**
 * About:
 * InfoWindowManager
 * 
 * Description:
 * Manages the Information Window that can be attached on Markers in the Map.
 */
class InfoWindowManager {
    static #map;
    static #infoWindow;
    static #overlay;
    static #title;
    static #content;
    static #footer;
    static #selectedVectorSection;
    static #selectedFeature;

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');
        
        this.#createInfoWindow();

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) {
        this.#map = map;

        this.#map.addOverlay(this.#overlay);
        this.#map.on(Events.openLayers.singleClick, this.#onSingleClick.bind(this));
        this.#map.on(Events.openLayers.pointerMove, this.#onPointerMove.bind(this));
    }

    static getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

    static #createInfoWindow() {
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
        const config = ConfigManager.getConfig();
        this.#overlay = new Overlay({
            element: this.#infoWindow,
            positioning: 'bottom-center',
            offset: [
                config.overlayOffset.horizontal,
                config.overlayOffset.vertical
            ],
            autoPan: true,
            autoPanAnimation: {
                duration: config.animationDuration.normal
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Events
    // -------------------------------------------------------------------

    static #onSingleClick(event) {
        const results = this.#map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
            return [feature, layer];
        });

        if(!results) {
            this.hideOverlay();
            this.#deselectFeature();

            return;
        }

        const feature = results[0];
        const layer = results[1];

        this.pulseAnimation(feature, layer);

        const infoWindow = feature?.getProperties()?.oltb?.infoWindow;
        if(infoWindow) {
            this.showOverlay(feature);
        }else {
            this.hideOverlay();
        }
    }

    static #onPointerMove(event) {
        const feature = this.#map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return feature;
        });

        if(this.#selectedVectorSection && (!feature || this.#selectedVectorSection !== feature)) {
            this.#deselectVectorSection();
        }

        const hightlight = feature?.getProperties()?.oltb?.highlightOnHover;
        if(hightlight) {
            this.#selectVectorSection(feature);
        }

        const nodeName = event.originalEvent.target.nodeName;
        const infoWindow = feature?.getProperties()?.oltb?.infoWindow;
        
        if(infoWindow && nodeName === 'CANVAS') {
            this.#map.getViewport().style.cursor = 'pointer';
        }else {
            this.#map.getViewport().style.cursor = 'default';
        }
    }

    // -------------------------------------------------------------------
    // # Section: Internal
    // -------------------------------------------------------------------

    static #selectFeature(feature) {
        this.#selectedFeature = feature;
    }

    static #deselectFeature() {
        if(!this.#selectedFeature) {
            return;
        }

        this.#selectedFeature = undefined;
    }

    static #selectVectorSection(section) {
        if(!section) {
            return;
        }

        const style = new Style({
            fill: new Fill({
                color: '#254372AA'
            }),
            stroke: new Stroke({
                color: '#369ACDFF',
                width: 1.5
            })
        });

        section.setStyle(style);
        this.#selectedVectorSection = section;
    }

    static #deselectVectorSection() {
        if(!this.#selectedVectorSection) {
            return;
        }

        this.#selectedVectorSection.setStyle(null);
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    static pulseAnimation(feature, layer = undefined) {
        const type = FeatureProperties.type.marker;
        const oltb = feature.getProperties()?.oltb;
        const animationConfig = ConfigManager.getConfig().marker.pulseAnimation;

        // Note:
        // Only animate the pure markers, not windbarbs and other features
        if(!oltb || oltb.type !== type || !animationConfig.isEnabled) {
            return;
        }

        // Note:
        // This mehtod might be invoked when the layer is "unknown", example navigating to a bookmark
        // Try and find the layer from the LayerManager
        if(!layer) {
            layer = LayerManager.getLayerFromFeature(feature);
        }

        if(!layer) {
            LogManager.logWarning(FILENAME, 'pulseAnimation', {
                info: 'No layer found for feature',
                featureId: getUid(feature)
            });

            return;
        }

        this.#selectFeature(feature);

        const start = Date.now();
        const color = oltb.style.markerFill;
        const startSize = oltb.style.radius;
        const endSize = oltb.style.radius + (oltb.style.radius / 2);
        
        const duration = animationConfig.duration;
        const shouldLoop = animationConfig.shouldLoop;
        const strokeWidth = animationConfig.strokeWidth;

        const pulseGeometry = feature.getGeometry().clone();
        const listenerKey = layer.on(Events.openLayers.postRender, animate.bind(this));

        // Note:
        // Render the map will trigger the postrender that runs the animation
        this.#map.render();

        function animate(event) {
            const frameState = event.frameState;
            const elapsed = frameState.time - start;
            
            if (elapsed >= duration || !this.#selectedFeature) {
                // Note:
                // Cancel active animation
                unByKey(listenerKey);

                // Note:
                // If the feature is still selected, rerun the animation
                if(this.#selectedFeature === feature && shouldLoop) {
                    this.pulseAnimation(feature, layer);
                }

                return;
            }

            const vectorContext = getVectorContext(event);
            const elapsedRatio = elapsed / duration;

            const radius = easeOut(elapsedRatio) * endSize + startSize;
            const opacity = easeOut(1 - elapsedRatio);
            
            const hexPercentage = Math.round(opacity * 100);
            const hex = HexTransparencies[hexPercentage];

            const style = new Style({
                image: new CircleStyle({
                    radius: radius,
                    stroke: new Stroke({
                        color: `${color.slice(0, -2)}${hex}`,
                        width: strokeWidth + opacity,
                    })
                })
            });

            vectorContext.setStyle(style);
            vectorContext.drawGeometry(pulseGeometry);

            // Note:
            // Continue to render the map until the animation has completed
            this.#map.render();
        }
    }

    static showOverlay(feature, position) {
        this.showOverlayDelayed(feature, position, 0);
    }

    static showOverlayDelayed(feature, position, delay = ConfigManager.getConfig().animationDuration.normal) {
        window.setTimeout(() => {
            const infoWindow = feature.getProperties().oltb.infoWindow;
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
                    feature.getGeometry().getExtent()
                ));
            }

            this.#infoWindow.focus();
            
            DOM.runAnimation(this.#infoWindow, CLASS_ANIMATION_CENTERED_BOUNCE);

            // Attach listeners to the function-buttons inside the infoWindow
            const uiRefRemoveButton = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-remove`);
            if(uiRefRemoveButton) {
                uiRefRemoveButton.addEventListener(
                    Events.browser.click, 
                    removeMarker.bind(this, InfoWindowManager, feature)
                );
            }

            const uiRefCopyCoordinatesButton = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-copy-coordinates`);
            if(uiRefCopyCoordinatesButton) {
                const value = uiRefCopyCoordinatesButton.getAttribute('data-oltb-coordinates');
                uiRefCopyCoordinatesButton.addEventListener(
                    Events.browser.click, 
                    copyMarkerCoordinates.bind(this, InfoWindowManager, value)
                );
            }

            const uiRefCopyInfoButton = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-copy-text`);
            if(uiRefCopyInfoButton) {
                const value = uiRefCopyInfoButton.getAttribute('data-oltb-copy');
                uiRefCopyInfoButton.addEventListener(
                    Events.browser.click, 
                    copyMarkerInfo.bind(this, InfoWindowManager, value)
                );
            }

            const uiRefEditButton = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-edit`);
            if(uiRefEditButton) {
                uiRefEditButton.addEventListener(
                    Events.browser.click, 
                    editMarker.bind(this, InfoWindowManager, feature)
                );
            }

            const uiRefShowLayer = this.#footer.querySelector(`#${ID_PREFIX_INFO_WINDOW}-show-layer`);
            if(uiRefShowLayer) {
                uiRefShowLayer.addEventListener(
                    Events.browser.click, 
                    showMarkerLayer.bind(this, InfoWindowManager, feature)
                );
            }
        }, delay);
    }

    static hideOverlay() {
        this.#deselectFeature();

        DOM.clearElements([
            this.#title,
            this.#content,
            this.#footer
        ])
        
        this.#overlay.setPosition(undefined);
    }
}

export { InfoWindowManager };