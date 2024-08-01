import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { getUid } from 'ol/util';
import { Overlay } from 'ol';
import { easeOut } from 'ol/easing.js';
import { unByKey } from 'ol/Observable';
import { getCenter } from 'ol/extent';
import { trapFocus } from '../../browser-helpers/trap-focus';
import { LogManager } from '../log-manager/log-manager';
import { editMarker } from './edit-marker';
import { BaseManager } from '../base-manager';
import { LayerManager } from '../layer-manager/layer-manager';
import { removeMarker } from './remove-marker';
import { ConfigManager } from '../config-manager/config-manager';
import { DefaultConfig } from '../config-manager/default-config';
import { FeatureManager } from '../feature-manager/feature-manager';
import { showMarkerLayer } from './show-marker-layer';
import { getVectorContext } from 'ol/render';
import { FeatureProperties } from '../../ol-helpers/feature-properties';
import { HexTransparencies } from '../../browser-constants/hex-transparencies';
import { copyMarkerInfoAsync } from './copy-marker-info';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';
import { copyMarkerCoordinatesAsync } from './copy-marker-coordinates';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';

const FILENAME = 'info-window-manager.js';
const CLASS__ANIMATION = 'oltb-animation';
const CLASS__ANIMATION_CENTERED_BOUNCE = `${CLASS__ANIMATION}--centered-bounce`;
const CLASS__INFO_WINDOW = 'oltb-info-window';
const ID__PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const MouseCursors = Object.freeze({
    default: 'default',
    pointer: 'pointer'
});

// Note:
// Works best on IconMarkers.
// FeatureProperties.type.windBarb is removed from the types collection for now.
const AnimationTypes = [
    FeatureProperties.type.iconMarker
];

const DefaultHighlightStyle = new Style({
    fill: new Fill({
        color: '#254372AA'
    }),
    stroke: new Stroke({
        color: '#369ACDFF',
        width: 1.5
    })
});

/**
 * About:
 * InfoWindowManager
 * 
 * Description:
 * Manages the Information Window that can be attached on Markers in the Map.
 */
class InfoWindowManager extends BaseManager {
    static #map;
    static #infoWindow;
    static #overlay;
    static #title;
    static #content;
    static #footer;
    static #selectedFeature;
    static #selectedVectorSection;
    static #hoveredVectorSection;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    static #createInfoWindow() {
        this.#infoWindow = DOM.createElement({
            element: 'div',
            class: `${CLASS__INFO_WINDOW} ${CLASS__ANIMATION}`,
            attributes: {
                'tabindex': '-1'
            },
            listeners: {
                'keydown': trapFocus
            }
        });

        const header = DOM.createElement({
            element: 'div',
            class: `${CLASS__INFO_WINDOW}__header`
        });

        this.#title = DOM.createElement({
            element: 'h3',
            class: `${CLASS__INFO_WINDOW}__title`
        });

        const closeButton = DOM.createElement({
            element: 'button', 
            html: getSvgIcon({
                path: SvgPaths.close.stroked,
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 1
            }),
            class: `${CLASS__INFO_WINDOW}__close oltb-btn oltb-btn--blank`,
            listeners: {
                'click': this.hideOverlay.bind(this)
            }
        });

        this.#content = DOM.createElement({
            element: 'div',
            class: `${CLASS__INFO_WINDOW}__content`
        });

        this.#footer = DOM.createElement({
            element: 'div',
            class: `${CLASS__INFO_WINDOW}__footer oltb-hide-scrollbars`
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

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    static #onSingleClick(event) {
        const results = this.#map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
            return [feature, layer];
        });

        if(!results) {
            this.#doSingleClickNoResults();
            return;
        }

        this.#doSingleClickWithResuls(results);
    }

    static #onPointerMove(event) {
        const feature = this.#map.forEachFeatureAtPixel(event.pixel, function(feature) {
            return feature;
        });

        this.#handleVectorHoverSections(feature);

        if(!feature) {
            this.setViewportCursor(MouseCursors.default);
            return;
        }

        this.#doPointerMoveWithResults(event, feature);
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    static #doSingleClickNoResults() {
        this.hideOverlay();
        this.deselectFeature();
        this.deselectHoveredVectorSection();
        this.deselectVectorSection();
    }

    static #doSingleClickWithResuls(results) {
        const [ feature, layer ] = results;

        this.tryPulseAnimation(feature, layer);
       
        const hasInfoWindow = FeatureManager.hasInfoWindow(feature);
        if(hasInfoWindow) {
            this.showOverlay(feature);
            this.deselectVectorSection();
        }else {
            this.hideOverlay();
            this.deselectVectorSection();
        }

        const shouldHighlight = FeatureManager.shouldHighlightOnHover(feature);
        if(hasInfoWindow && shouldHighlight) {
            this.selectVectorSection(feature);
        }
    }

    static #doPointerMoveWithResults(event, feature) {
        const shouldHighlight = FeatureManager.shouldHighlightOnHover(feature);
        if(shouldHighlight) {
            this.selectHoveredVectorSection(feature);
        }

        const nodeName = event.originalEvent.target.nodeName;
        const hasInfoWindow = FeatureManager.hasInfoWindow(feature);
        if(hasInfoWindow && nodeName === 'CANVAS') {
            this.setViewportCursor(MouseCursors.pointer);
        }else {
            this.setViewportCursor(MouseCursors.default);
        }
    }

    static #handleVectorHoverSections(feature) {
        if(
            !feature && 
            !this.#selectedVectorSection
        ) {
            this.deselectHoveredVectorSection();
            this.deselectVectorSection();
        }

        if(
            this.#hoveredVectorSection && 
            this.#hoveredVectorSection !== feature &&
            this.#hoveredVectorSection !== this.#selectedVectorSection
        ) {
            this.deselectHoveredVectorSection();
        }
    }

    static #pulseAnimation(feature, layer, properties, animationConfig) {
        this.selectFeature(feature);

        const start = Date.now();
        const color = this.getAnimationColor(properties);
        const minSize = this.getAnimationMin(properties);
        const maxSize = this.getAnimationMax(properties);
        
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
            
            if(elapsed >= duration || !this.#selectedFeature) {
                // Note:
                // Cancel active animation
                unByKey(listenerKey);

                // Note:
                // If the feature is still selected, rerun the animation
                if(FeatureManager.isSameFeature(this.#selectedFeature, feature) && shouldLoop) {
                    this.#pulseAnimation(feature, layer, properties, animationConfig);
                }

                return;
            }

            const vectorContext = getVectorContext(event);
            const elapsedRatio = elapsed / duration;

            const radius = easeOut(elapsedRatio) * maxSize + minSize;
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

    static #attachFunctionButtons(feature) {
        const uiRefRemoveButton = this.#footer.querySelector(`#${ID__PREFIX_INFO_WINDOW}-remove`);
            if(uiRefRemoveButton) {
                uiRefRemoveButton.addEventListener(
                    Events.browser.click, 
                    removeMarker.bind(this, InfoWindowManager, feature)
                );
            }

            const uiRefCopyCoordinatesButton = this.#footer.querySelector(`#${ID__PREFIX_INFO_WINDOW}-copy-coordinates`);
            if(uiRefCopyCoordinatesButton) {
                const value = uiRefCopyCoordinatesButton.getAttribute('data-oltb-coordinates');
                uiRefCopyCoordinatesButton.addEventListener(
                    Events.browser.click, 
                    copyMarkerCoordinatesAsync.bind(this, InfoWindowManager, value)
                );
            }

            const uiRefCopyInfoButton = this.#footer.querySelector(`#${ID__PREFIX_INFO_WINDOW}-copy-text`);
            if(uiRefCopyInfoButton) {
                const value = uiRefCopyInfoButton.getAttribute('data-oltb-copy');
                uiRefCopyInfoButton.addEventListener(
                    Events.browser.click, 
                    copyMarkerInfoAsync.bind(this, InfoWindowManager, value)
                );
            }

            const uiRefEditButton = this.#footer.querySelector(`#${ID__PREFIX_INFO_WINDOW}-edit`);
            if(uiRefEditButton) {
                uiRefEditButton.addEventListener(
                    Events.browser.click, 
                    editMarker.bind(this, InfoWindowManager, feature)
                );
            }

            const uiRefShowLayer = this.#footer.querySelector(`#${ID__PREFIX_INFO_WINDOW}-show-layer`);
            if(uiRefShowLayer) {
                uiRefShowLayer.addEventListener(
                    Events.browser.click, 
                    showMarkerLayer.bind(this, InfoWindowManager, feature)
                );
            }
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static tryPulseAnimation(feature, layer) {
        // TODO:
        // This was a messy method, make it prettier in future.
        const oltb = DefaultConfig.toolbar.id;
        const properties = feature.get(oltb);
        const animationConfig = ConfigManager.getConfig().marker.pulseAnimation;

        // Note:
        // Only animate oltb markers and wind-barbs
        if(!properties || !AnimationTypes.includes(properties.type) || !animationConfig.isEnabled) {
            return;
        }

        // Note:
        // This method might be invoked when the layer is "unknown", example navigating to a Bookmark
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

        // Note:
        // Already animating this feature
        // Example if the user repeatedly navigates to the same Bookmark
        if(this.#selectedFeature && FeatureManager.isSameFeature(this.#selectedFeature, feature)) {
            return;
        }

        this.#pulseAnimation(feature, layer, properties, animationConfig);
    }

    static showOverlay(feature, position) {
        this.showOverlayDelayed(feature, position, 0);
    }

    static showOverlayDelayed(feature, position, delay = ConfigManager.getConfig().animationDuration.normal) {
        window.setTimeout(() => {
            const infoWindow = FeatureManager.getInfoWindow(feature);
            if(!infoWindow) {
                return;
            }

            this.doShowOverlayWithResult(infoWindow, feature, position);
        }, delay);
    }

    static doShowOverlayWithResult(infoWindow, feature, position) {
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

        this.#attachFunctionButtons(feature);
        this.#infoWindow.focus();
        
        DOM.runAnimation(this.#infoWindow, CLASS__ANIMATION_CENTERED_BOUNCE);
    }

    static hideOverlay() {
        this.deselectFeature();
        this.deselectHoveredVectorSection();
        this.deselectVectorSection();

        DOM.clearElements([
            this.#title,
            this.#content,
            this.#footer
        ])
        
        this.#overlay.setPosition(undefined);
    }

    static getAnimationMin(properties) {
        if(_.has(properties, ['marker'])) {
            return properties.marker.radius;
        }

        return DefaultConfig.marker.pulseAnimation.defaultStartSize;
    }

    static getAnimationMax(properties) {
        if(_.has(properties, ['marker'])) {
            return properties.marker.radius + (properties.marker.radius / 2);
        }

        return DefaultConfig.marker.pulseAnimation.defaultEndSize;
    }

    static getAnimationColor(properties) {
        if(_.has(properties, ['marker'])) {
            return properties.marker.fill;
        }

        if(_.has(properties, ['icon'])) {
            return properties.icon.stroke;
        }

        return DefaultConfig.marker.pulseAnimation.defaultColor;
    }

    static isContentEmpty() {
        return this.#content.innerHTML.length === 0;
    }

    static getInfoWindow() {
        return this.#infoWindow;
    }

    static setViewportCursor(cursor) {
        this.#map.getViewport().style.cursor = cursor;
    }

    static getViewportCursor() {
        return this.#map.getViewport().style.cursor;
    }

    static selectFeature(feature) {
        this.#selectedFeature = feature;
        this.deselectVectorSection();
    }

    static deselectFeature() {
        this.#selectedFeature = undefined;
    }

    static isFeatureSelected() {
        return !!this.#selectedFeature;
    }

    static selectHoveredVectorSection(section) {
        section?.setStyle(DefaultHighlightStyle);
        this.#hoveredVectorSection = section;
    }

    static deselectHoveredVectorSection() {
        this.#hoveredVectorSection?.setStyle(null);
        this.#hoveredVectorSection = undefined;
    }

    static isHoveredVectorSectionSelected() {
        return !!this.#hoveredVectorSection;
    }

    static selectVectorSection(section) {
        section?.setStyle(DefaultHighlightStyle);
        this.#selectedVectorSection = section;
        this.deselectFeature();
    }

    static deselectVectorSection() {
        this.#selectedVectorSection?.setStyle(null);
        this.#selectedVectorSection = undefined;
    }

    static isVectorSectionSelected() {
        return !!this.#selectedVectorSection;
    }
}

export { InfoWindowManager };