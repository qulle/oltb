import _ from 'lodash';
import jsts from 'jsts/dist/jsts.min';
import { DOM } from '../helpers/browser/DOM';
import { Draw } from 'ol/interaction';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Feature } from 'ol';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { SnapManager } from '../core/managers/SnapManager';
import { LayerManager } from '../core/managers/LayerManager';
import { StateManager } from '../core/managers/StateManager';
import { GeometryType } from '../core/ol-types/GeometryType';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { isFeatureIntersectable } from '../helpers/IsFeatureIntersectable';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { GeometryCollection, LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom';

const FILENAME = 'tools/ScissorsTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

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
    onSnapped: undefined
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
class ScissorsTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.scissors.filled,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Polygon Scissors (${ShortcutKeys.scissorsTool})`
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

        // JSTS
        this.parser = new jsts.io.OL3Parser();
        this.parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);

        this.interactionDraw = this.generateOLInteractionDraw();

        this.interactionDraw.on(Events.openLayers.drawStart, this.onDrawStart.bind(this));
        this.interactionDraw.on(Events.openLayers.drawEnd, this.onDrawEnd.bind(this));
        this.interactionDraw.on(Events.openLayers.drawAbort, this.onDrawAbort.bind(this));
        this.interactionDraw.on(Events.openLayers.error, this.onDrawError.bind(this));

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        if(this.isActive) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Note: The Snap interaction must be added last
        this.doAddDrawInteraction();
        ToolManager.setActiveTool(this);
        SnapManager.addSnap(this);

        this.isActive = true;
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doRemoveDrawInteraction();
        ToolManager.removeActiveTool();
        SnapManager.removeSnap();

        this.isActive = false;
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deSelectTool() {
        this.deActivateTool();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onDOMContentLoaded() {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        const key = event.key;

        if(key === Keys.valueEscape) {
            if(this.interactionDraw) {
                this.interactionDraw.abortDrawing();
            }
        }else if(event.ctrlKey && key === Keys.valueZ) {
            if(this.interactionDraw) {
                this.interactionDraw.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, ShortcutKeys.scissorsTool)) {
            this.onClickTool(event);
        }
    }

    onWindowBrowserStateCleared() {
        if(this.isActive) {
            this.deActivateTool();
        }

        // Note: Consumer callback
        if(this.options.onBrowserStateClear instanceof Function) {
            this.options.onBrowserStateClear();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onDrawStart(event) {
        this.doDrawStart(event);
    }

    onDrawEnd(event) {
        this.doDrawEnd(event);
    }

    onDrawAbort(event) {
        this.doDrawAbort(event);
    }

    onDrawError(event) {
        this.doDrawError(event);
    }

    onSnap(event) {
        this.doSnap(event);
    }

    // -------------------------------------------------------------------
    // # Section: Generator Helpers
    // -------------------------------------------------------------------

    generateOLInteractionDraw() {
        const style = this.generateOLStyleObject();

        return new Draw({
            type: GeometryType.LineString,
            stopClick: true,
            style: style
        });
    }

    generateOLStyleObject() {
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

    generateJSTSPolygonizer() {
        return new jsts.operation.polygonize.Polygonizer();
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doDrawStart(event) {
        // Note: Consumer callback
        if(this.options.onStart instanceof Function) {
            this.options.onStart(event);
        }
    }

    doDrawEnd(event) {
        const lineFeature = event.feature;
        const featureGeometry = lineFeature.getGeometry();

        // Note: Must search all layers thus features from different layers can be targeted
        const layerWrappers = LayerManager.getFeatureLayers();
        layerWrappers.forEach((layerWrapper) => {
            const layer = layerWrapper.getLayer();

            if(!layer.getVisible()) {
                return;
            }

            const source = layer.getSource();
            source.forEachFeatureIntersectingExtent(featureGeometry.getExtent(), (intersectedFeature) => {
                const type = intersectedFeature.getProperties()?.oltb?.type;
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
                title: 'Oops',
                message: 'No intersecting object found', 
                autoremove: Config.autoRemovalDuation.normal
            });
        }

        // Note: Consumer callback
        if(this.options.onEnd instanceof Function) {
            this.options.onEnd(event);
        }

        this.intersectedFeatures = [];
    }

    doDrawAbort(event) {
        // Note: Consumer callback
        if(this.options.onAbort instanceof Function) {
            this.options.onAbort(event);
        }
    }

    doDrawError(event) {
        // Note: Consumer callback
        if(this.options.onError instanceof Function) {
            this.options.onError(event);
        }
    }

    doSnap(event) {
        // Note: Consumer callback
        if(this.options.onSnapped instanceof Function) {
            this.options.onSnapped(event);
        }
    }

    doAddDrawInteraction() {
        this.getMap().addInteraction(this.interactionDraw);
    }

    doRemoveDrawInteraction() {
        this.getMap().removeInteraction(this.interactionDraw);
    }

    doSplitPolygon(polygonFeature, lineFeature) {
        // Parse into JSTS objects
        const parsedPolygon = this.parser.read(polygonFeature.getGeometry());
        const parsedLine = this.parser.read(lineFeature.getGeometry());             

        // Splitting polygon in two part
        const polygonizer = this.generateJSTSPolygonizer();
        const union = parsedPolygon.getExteriorRing().union(parsedLine);

        polygonizer.add(union);
        const polygons = polygonizer.getPolygons();
        
        // Note: Only proceed if two parts
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
            const style = this.generateOLStyleObject();
            const featureCoordiantes = this.parser.write(geometry).getCoordinates();

            const splittedPolygonFeature = new Feature({
                geometry: new Polygon(featureCoordiantes),
            });

            splittedPolygonFeature.setStyle(style);
            
            const layerWrapper = LayerManager.getActiveFeatureLayer();
            LayerManager.addFeatureToLayer(splittedPolygonFeature, layerWrapper);
        });

        LayerManager.removeFeatureFromFeatureLayers(polygonFeature);
    }
}

export { ScissorsTool };