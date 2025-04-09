import _ from 'lodash';
import * as jsts from 'jsts/dist/jsts.min';
import { DOM } from '../../browser-helpers/dom-factory';
import { Draw } from 'ol/interaction';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { Feature } from 'ol';
import { BaseTool } from '../base-tool';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { KeyboardKeys } from '../../browser-constants/keyboard-keys';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { GeometryType } from '../../ol-mappers/ol-geometry/ol-geometry';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { FeatureManager } from '../../toolbar-managers/feature-manager/feature-manager';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { FeatureProperties } from '../../ol-helpers/feature-properties';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';
import { isFeatureIntersectable } from '../../ol-helpers/is-feature-intersectable';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { GeometryCollection, LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom';

const FILENAME = 'scissors-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.scissorsTool';

const DefaultOptions = Object.freeze({
    strokeWidth: '2.5',
    strokeColor: '#0166A5FF',
    fillColor: '#D7E3FA80',
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStart: undefined,
    onEnd: undefined,
    onAbort: undefined,
    onError: undefined,
    onSnapped: undefined,
    onUnSnapped: undefined
});

const LocalStorageNodeName = LocalStorageKeys.scissorsTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false
});

/**
 * About:
 * Cut polygon shapes in smaller parts
 * 
 * Description:
 * Draw a line to cut polygon shapes in half.
 */
class ScissorsTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.scissors.filled,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.scissorsTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.scissorsTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.isActive = false;
        this.intersectedFeatures = [];
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.parser = new jsts.io.OL3Parser();
        this.parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);

        this.interactionDraw = this.#generateOLInteractionDraw();
        this.interactionDraw.on(Events.openLayers.drawStart, this.#onDrawStart.bind(this));
        this.interactionDraw.on(Events.openLayers.drawEnd, this.#onDrawEnd.bind(this));
        this.interactionDraw.on(Events.openLayers.drawAbort, this.#onDrawAbort.bind(this));
        this.interactionDraw.on(Events.openLayers.error, this.#onDrawError.bind(this));

        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        this.onOLTBReadyBind = this.#onOLTBReady.bind(this);
        this.onWindowBrowserStateClearedBind = this.#onWindowBrowserStateCleared.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.removeEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);

        if(this.isActive) {
            this.deactivateTool();
        }else {
            this.activateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Note: 
        // The Snap interaction must be added last
        this.doAddDrawInteraction();
        ToolManager.setActiveTool(this);
        SnapManager.addSnap(this);

        this.isActive = true;
        this.button.classList.add(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deactivateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doRemoveDrawInteraction();
        ToolManager.removeActiveTool();
        SnapManager.removeSnap();

        this.isActive = false;
        this.button.classList.remove(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deselectTool() {
        this.deactivateTool();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    #onWindowKeyUp(event) {
        const key = event.key;
        if(key === KeyboardKeys.valueEscape) {
            if(this.interactionDraw) {
                this.interactionDraw.abortDrawing();
            }
        }else if(event.ctrlKey && key === KeyboardKeys.valueZ) {
            if(this.interactionDraw) {
                this.interactionDraw.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, ShortcutKeys.scissorsTool)) {
            this.onClickTool(event);
        }
    }

    #onWindowBrowserStateCleared() {
        this.doClearState();

        if(this.isActive) {
            this.deactivateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onDrawStart(event) {
        this.doDrawStart(event);
    }

    #onDrawEnd(event) {
        this.doDrawEnd(event);
    }

    #onDrawAbort(event) {
        this.doDrawAbort(event);
    }

    #onDrawError(event) {
        this.doDrawError(event);
    }

    // Note:
    // This is a global event that is invoked from the SnapManager
    onSnap(event) {
        this.doSnap(event);
    }

    onUnSnap(event) {
        this.doUnSnap(event);
    }

    //--------------------------------------------------------------------
    // # Section: Generator Helpers
    //--------------------------------------------------------------------
    #generateOLInteractionDraw() {
        const style = this.#generateOLStyleObject();

        return new Draw({
            type: GeometryType.LineString,
            stopClick: true,
            style: style
        });
    }

    #generateOLStyleObject() {
        return new Style({
            image: new Circle({
                fill: new Fill({
                    color: this.options.fillColor
                }),
                stroke: new Stroke({
                    color: this.options.strokeColor,
                    width: this.options.strokeWidth
                }),
                radius: 5
            }),
            fill: new Fill({
                color: this.options.fillColor
            }),
            stroke: new Stroke({
                color: this.options.strokeColor,
                width: this.options.strokeWidth
            })
        });
    }

    #generateJSTSPolygonizer() {
        return new jsts.operation.polygonize.Polygonizer();
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doDrawStart(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onStart) {
            this.options.onStart(event);
        }
    }

    doDrawEnd(event) {
        const lineFeature = event.feature;
        const featureGeometry = lineFeature.getGeometry();

        // Note: 
        // Must search all layers thus features from different layers can be targeted
        const layerWrappers = LayerManager.getFeatureLayers();
        layerWrappers.forEach((layerWrapper) => {
            const layer = layerWrapper.getLayer();
            if(!layer.getVisible()) {
                return;
            }

            const source = layer.getSource();
            source.forEachFeatureIntersectingExtent(featureGeometry.getExtent(), (intersectedFeature) => {
                const type = FeatureManager.getType(intersectedFeature);
                const geometry = intersectedFeature.getGeometry();
    
                if(isFeatureIntersectable(type, geometry)) {
                    this.intersectedFeatures.push(intersectedFeature);
                }
            });
        });

        this.intersectedFeatures.forEach((intersected) => {
            const type = intersected.getGeometry().getType();
            if(type === GeometryType.Polygon) {
                this.doSplitPolygon(intersected, lineFeature);
            }
        });

        if(this.intersectedFeatures.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingIntersections`,
                autoremove: true
            });
        }

        // Note: 
        // @Consumer callback
        if(this.options.onEnd) {
            this.options.onEnd(event);
        }

        this.intersectedFeatures = [];
    }

    doDrawAbort(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onAbort) {
            this.options.onAbort(event);
        }
    }

    doDrawError(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onError) {
            this.options.onError(event);
        }
    }

    doSnap(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onSnapped) {
            this.options.onSnapped(event);
        }
    }

    doUnSnap(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onUnSnapped) {
            this.options.onUnSnapped(event);
        }
    }

    doAddDrawInteraction() {
        this.getMap().addInteraction(this.interactionDraw);
    }

    doRemoveDrawInteraction() {
        this.getMap().removeInteraction(this.interactionDraw);
    }

    doSplitPolygon(polygonFeature, lineFeature) {
        // Check if original feature has any custom type
        const featureType = FeatureManager.getType(polygonFeature) || FeatureProperties.type.drawing;

        // Parse into JSTS objects
        const parsedPolygon = this.parser.read(polygonFeature.getGeometry());
        const parsedLine = this.parser.read(lineFeature.getGeometry());             

        // Splitting polygon in two part
        const polygonizer = this.#generateJSTSPolygonizer();
        const union = parsedPolygon.getExteriorRing().union(parsedLine);

        polygonizer.add(union);
        const polygons = polygonizer.getPolygons();
        
        // Note: 
        // Only proceed if two parts
        if(polygons.array.length !== 2) {
            return;
        }

        const numHoles = parsedPolygon.getNumInteriorRing();
        polygons.array.forEach((geometry) => {
            // Logic for splitting polygon with holes
            for(let a = 0; a < numHoles; a++) {
                let hole = parsedPolygon.getInteriorRingN(a);
                const holeCoordinates = [];

                for(let b in hole.getCoordinates()) {
                    holeCoordinates.push([hole.getCoordinates()[b].x, hole.getCoordinates()[b].y])
                }

                hole = this.parser.read(new Polygon([holeCoordinates]));
                geometry = geometry.difference(hole);
            }

            // Apply style and add the polygons to the layer
            const style = this.#generateOLStyleObject();
            const featureCoordiantes = this.parser.write(geometry).getCoordinates();
            const splittedPolygonFeature = new Feature({
                geometry: new Polygon(featureCoordiantes),
                oltb: {
                    type: featureType
                }
            });

            splittedPolygonFeature.setStyle(style);
            
            const layerWrapper = LayerManager.getActiveFeatureLayer();
            LayerManager.addFeatureToLayer(splittedPolygonFeature, layerWrapper);
        });

        LayerManager.removeFeatureFromFeatureLayers(polygonFeature);
    }
}

export { ScissorsTool };