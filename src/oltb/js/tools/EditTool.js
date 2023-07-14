import jsts from 'jsts/dist/jsts.min';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Feature } from 'ol';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { Settings } from '../helpers/constants/Settings';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { shiftKeyOnly } from 'ol/events/condition';
import { LayerManager } from '../core/managers/LayerManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { TooltipManager } from '../core/managers/TooltipManager';
import { generateTooltip } from '../generators/GenerateTooltip';
import { SettingsManager } from '../core/managers/SettingsManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { Fill, Stroke, Style } from 'ol/style';
import { hasCustomFeatureProperty } from '../helpers/browser/HasNestedProperty';
import { getCustomFeatureProperty } from '../helpers/browser/GetNestedProperty';
import { Select, Modify, Translate } from 'ol/interaction';
import { getMeasureCoordinates, getMeasureValue } from '../helpers/Measurements';
import { GeometryCollection, LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom';

/*!
 *  JSTS
 *  To avoid circular dependencies i include the full dist
 *  This increases the bundle size but removes errors/warnings in Rollup build process
 *  Also more features can be used from this lib in the future
 *   
 *  https://github.com/bjornharrtell/jsts#caveats
 */

const FILENAME = 'tools/EditTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID_PREFIX = 'oltb-edit';
const KEY_TOOLTIP = 'edit';

const DefaultOptions = Object.freeze({
    hitTolerance: 5,
    click: undefined,
    styleChange: undefined,
    shapeOperation: undefined,
    selectadd: undefined,
    selectremove: undefined,
    modifystart: undefined,
    modifyend: undefined,
    translatestart: undefined,
    translateend: undefined,
    removedfeature: undefined,
    error: undefined
});

const LocalStorageNodeName = LocalStorageKeys.editTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false,
    strokeColor: '#4A86B8FF',
    fillColor: '#D7E3FA80'
});

const DefaultButtonProps = Object.freeze({
    width: 20,
    height: 20,
    fill: '#FFFFFFFF',
    stroke: 'none',
    class: 'oltb-btn__icon'
});

const DefaultDrawingStyle = new Style({
    fill: new Fill({
        color: '#D7E3FA80'
    }),
    stroke: new Stroke({
        color: '#4A86B8FF',
        width: 2.5
    })
});

const DefaultMeasureStyle = new Style({
    fill: new Fill({
        color: '#FFFFFF66'
    }),
    stroke: new Stroke({
        color: '#3B4352FF',
        lineDash: [2, 5],
        width: 2.5
    })
});

class EditTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.cursor.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                type: 'button',
                'data-tippy-content': `Edit (${ShortcutKeys.editTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.lastStyle = undefined;
        this.options = { ...DefaultOptions, ...options };

        // JSTS
        this.parser = new jsts.io.OL3Parser();
        this.parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );
        
        const uiRefToolboxElement = ElementManager.getToolboxElement();
        uiRefToolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Edit tool
                        <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label">Misc</label>
                        <button type="button" id="${ID_PREFIX}-delete-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Delete">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.trash.stroked })}
                        </button>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group ${CLASS_TOOLBOX_SECTION}__group--sub-toolbar">
                        <label class="oltb-label">Shapes</label>
                        <button type="button" id="${ID_PREFIX}-union-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Union">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.union.mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-intersect-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Intersect">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.intersect.mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-exclude-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Exclude">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.exclude.mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-difference-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Difference">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.subtract.mixed })}
                        </button>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-stroke-color">Stroke color</label>
                        <div id="${ID_PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                        </div>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-fill-color">Fill color</label>
                        <div id="${ID_PREFIX}-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-fill-color" data-oltb-color="${this.localStorage.fillColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.fillColor};"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.uiRefEditToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        this.uiRefDeleteSelectedButton = this.uiRefEditToolbox.querySelector(`#${ID_PREFIX}-delete-selected-button`);
        this.uiRefDeleteSelectedButton.addEventListener(Events.browser.click, this.onDeleteSelectedFeatures.bind(this));

        this.uiRefUnionSelectedButton = this.uiRefEditToolbox.querySelector(`#${ID_PREFIX}-union-selected-button`);
        this.uiRefUnionSelectedButton.addEventListener(Events.browser.click, this.onShapeOperator.bind(this, this.unionFeatures, 'union'));

        this.uiRefIntersectSelectedButton = this.uiRefEditToolbox.querySelector(`#${ID_PREFIX}-intersect-selected-button`);
        this.uiRefIntersectSelectedButton.addEventListener(Events.browser.click, this.onShapeOperator.bind(this, this.intersectFeatures, 'intersect'));

        this.uiRefExcludeSelectedButton = this.uiRefEditToolbox.querySelector(`#${ID_PREFIX}-exclude-selected-button`);
        this.uiRefExcludeSelectedButton.addEventListener(Events.browser.click, this.onShapeOperator.bind(this, this.excludeFeatures, 'exclude'));

        this.uiRefDifferenceSelectedButton = this.uiRefEditToolbox.querySelector(`#${ID_PREFIX}-difference-selected-button`);
        this.uiRefDifferenceSelectedButton.addEventListener(Events.browser.click, this.onShapeOperator.bind(this, this.differenceFeatures, 'difference'));

        this.uiRefFillColor = this.uiRefEditToolbox.querySelector(`#${ID_PREFIX}-fill-color`);
        this.uiRefFillColor.addEventListener(Events.custom.colorChange, this.onFeatureColorChange.bind(this));

        this.uiRefStrokeColor = this.uiRefEditToolbox.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.uiRefStrokeColor.addEventListener(Events.custom.colorChange, this.onFeatureColorChange.bind(this));

        const uiRefToggleableTriggers = this.uiRefEditToolbox.querySelectorAll('.oltb-toggleable');
        uiRefToggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        this.select = new Select({
            hitTolerance: this.options.hitTolerance,
            filter: function(feature, layer) {
                const selectable = !hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.notSelectable);
                const isFeatureLayer = LayerManager.getFeatureLayers().find((layerWrapper) => {
                    return layerWrapper.getLayer().getSource().hasFeature(feature);
                });
                
                return (selectable && (isFeatureLayer || 
                    SettingsManager.getSetting(Settings.selectVectorMapShapes)
                ));
            },
            style: this.lastStyle
        });
        
        this.modify = new Modify({
            features: this.select.getFeatures(),
            condition: function(event) {
                return shiftKeyOnly(event);
            }
        });

        this.translate = new Translate({
            features: this.select.getFeatures(),
        });

        this.select.getFeatures().on(Events.openLayers.add, this.onSelectFeatureAdd.bind(this));
        this.select.getFeatures().on(Events.openLayers.remove, this.onSelectFeatureRemove.bind(this));

        this.modify.addEventListener(Events.openLayers.modifyStart, this.onModifyStart.bind(this));
        this.modify.addEventListener(Events.openLayers.modifyEnd, this.onModifyEnd.bind(this));

        this.translate.addEventListener(Events.openLayers.translateStart, this.onTranslateStart.bind(this));
        this.translate.addEventListener(Events.openLayers.translateEnd, this.onTranslateEnd.bind(this));

        window.addEventListener(Events.custom.featureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onSelectFeatureAdd(event) {
        // User defined callback from constructor
        if(this.options.selectadd instanceof Function) {
            this.options.selectadd(event);
        }
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    isMeasurementType(feature) {
        return getCustomFeatureProperty(feature.getProperties(), 'type') === FeatureProperties.type.measurement;
    }

    onSelectFeatureRemove(event) {
        const feature = event.element;

        // The setTimeout must be used
        // If not, the style will be reset to the style used before the feature was selected
        window.setTimeout(() => {
            if(this.colorHasChanged) {
                // Set the lastStyle as the default style
                feature.setStyle(this.lastStyle);

                if(this.isMeasurementType(feature)) {
                    // To add lineDash, a new Style object must be used
                    // If the lastStyle is used all object that is referenced with that object will get a dashed line
                    const style = new Style({
                        fill: new Fill({
                            color: this.lastStyle.getFill().getColor()
                        }),
                        stroke: new Stroke({
                            color: this.lastStyle.getStroke().getColor(),
                            width: this.lastStyle.getStroke().getWidth(),
                            lineDash: [2, 5]
                        })
                    });
                    
                    feature.setStyle(style);
                }

                // User defined callback from constructor
                if(this.options.styleChange instanceof Function) {
                    this.options.styleChange(event, this.lastStyle);
                }

                // Reset for the last deselected item
                if(event.index === 0) {
                    this.colorHasChanged = false;
                }
            }
        });

        // User defined callback from constructor
        if(this.options.selectremove instanceof Function) {
            this.options.selectremove(event);
        }
    }

    onModifyStart(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip)) {
                this.attachOnChange(feature);
            }
        });

        // User defined callback from constructor
        if(this.options.modifystart instanceof Function) {
            this.options.modifystart(event);
        }
    }

    onModifyEnd(event) {
        const features = event.features;
        features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip)) {
                this.detachOnChange(feature);
            }
        });

        // User defined callback from constructor
        if(this.options.modifyend instanceof Function) {
            this.options.modifyend(event);
        }
    }

    onTranslateStart(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip)) {
                this.attachOnChange(feature);
            }
        });

        // User defined callback from constructor
        if(this.options.translatestart instanceof Function) {
            this.options.translatestart(event);
        }
    }

    onTranslateEnd(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip)) {
                this.detachOnChange(feature);
            }
        });

        // User defined callback from constructor
        if(this.options.translateend instanceof Function) {
            this.options.translateend(event);
        }
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.editTool)) {
            this.handleClick(event);
        }else if(Boolean(this.active) && event.key === Keys.valueDelete) {
            this.onDeleteSelectedFeatures();
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = { ...LocalStorageDefaults };

        this.uiRefFillColor.setAttribute('data-oltb-color', this.localStorage.fillColor);
        this.uiRefFillColor.firstElementChild.style.backgroundColor = this.localStorage.fillColor;

        this.uiRefStrokeColor.setAttribute('data-oltb-color', this.localStorage.strokeColor);
        this.uiRefStrokeColor.firstElementChild.style.backgroundColor = this.localStorage.strokeColor;
    }

    onDeleteSelectedFeatures() {
        const featureLength = this.select.getFeatures().getArray().length;

        if(featureLength === 0) {
            Toast.info({
                title: 'Oops',
                message: 'No features selected to delete', 
                autoremove: Config.autoRemovalDuation.normal
            });

            return;
        }

        const genetiveLimit = 1;
        const genetiveChar = featureLength > genetiveLimit ? 's': '';
        Dialog.confirm({
            title: 'Delete feature',
            message: `Delete ${featureLength} selected feature${genetiveChar}?`,
            confirmText: 'Delete',
            onConfirm: () => {
                const features = [ ...this.select.getFeatures().getArray() ];
                this.deleteFeatures(features);
            }
        });
    }

    deleteFeatures(features) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const layerWrappers = LayerManager.getFeatureLayers();

        // The user can select features from any layer
        // Each feature needs to be removed from its associated layer
        features.forEach((feature) => {
            layerWrappers.forEach((layerWrapper) => {
                const source = layerWrapper.getLayer().getSource();
                if(source.hasFeature(feature)) {
                    // Remove feature from layer
                    source.removeFeature(feature);

                    // Remove feature from selected collection
                    this.select.getFeatures().remove(feature);

                    // Remove overlays associated with the feature
                    if(hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip)) {
                        map.removeOverlay(feature.getProperties().oltb.tooltip);
                    }

                    // User defined callback from constructor
                    if(this.options.removedfeature instanceof Function) {
                        this.options.removedfeature(feature);
                    }
                }
            });
        });
    }

    onFeatureColorChange(event) {
        this.colorHasChanged = true;

        const fillColor = this.uiRefFillColor.getAttribute('data-oltb-color');
        const strokeColor = this.uiRefStrokeColor.getAttribute('data-oltb-color');

        const features = [ ...this.select.getFeatures().getArray() ];

        this.lastStyle = new Style({
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: strokeColor,
                width: 2.5
            })
        });

        features.forEach((feature) => {
            feature.setStyle(this.lastStyle);      
        });

        this.localStorage.fillColor = this.lastStyle.getFill().getColor();
        this.localStorage.strokeColor = this.lastStyle.getStroke().getColor();

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    isTwoAndOnlyTwoShapes(features) {
        return features.length === 2;
    }

    onShapeOperator(operation, type) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const features = [ ...this.select.getFeatures().getArray() ];

        if(!this.isTwoAndOnlyTwoShapes(features)) {
            Toast.info({
                title: 'Oops',
                message: 'Strict two overlapping features must be selected', 
                autoremove: Config.autoRemovalDuation.normal
            });

            return;
        }

        try {
            const a = features[0];
            const b = features[1];

            const aGeometry = this.parser.read(a.getGeometry());
            const bGeometry = this.parser.read(b.getGeometry());

            // JSTS Lib operation
            const shape = operation(aGeometry, bGeometry);

            // Create new feature with that shape
            const feature = new Feature({
                geometry: new Polygon(this.parser.write(shape).getCoordinates()),
            });

            // Check if a or b was a measurement, if so, create a new tooltip
            if(this.isMeasurementType(a) || this.isMeasurementType(b)) {
                const tooltip = generateTooltip();

                feature.setProperties({
                    oltb: {
                        type: FeatureProperties.type.measurement,
                        tooltip: tooltip.getOverlay()
                    }
                });

                const geometry = feature.getGeometry();
                tooltip.setPosition(getMeasureCoordinates(geometry));

                const measureValue = getMeasureValue(geometry);
                tooltip.setData(`${measureValue.value} ${measureValue.unit}`);

                map.addOverlay(tooltip.getOverlay());
                feature.setStyle(DefaultMeasureStyle);
            }else {
                feature.setStyle(DefaultDrawingStyle);
            }

            // Add the unioned shape
            const layerWrapper = LayerManager.getActiveFeatureLayer();
            const source = layerWrapper.getLayer().getSource();

            source.addFeature(feature);

            // Remove two original shapes
            this.deleteFeatures(features);

            // User defined callback from constructor
            if(this.options.shapeOperation instanceof Function) {
                this.options.shapeOperation(type, a, b, feature);
            }
        }catch(error) {
            const errorMessage = 'Failed to perform shape operation';
            LogManager.logError(FILENAME, 'onShapeOperator', {
                message: errorMessage,
                error: error
            });
            
            Toast.error({
                title: 'Error',
                message: errorMessage
            }); 

            // User defined callback from constructor
            if(this.options.error instanceof Function) {
                this.options.error(error);
            }
        }
    }

    unionFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.union(a, b);
    }

    intersectFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.intersection(a, b);
    }

    excludeFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.symDifference(a, b);
    }

    differenceFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.difference(a, b);
    }

    onWindowFeatureLayerRemoved(event) {
        this.select.getFeatures().clear();
    }

    attachOnChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();

        if(Boolean(hasOtherTooltip) && selectedFeatures.length === 1) {
            this.tooltipItem = TooltipManager.push(KEY_TOOLTIP);
        }

        const properties = feature.getProperties();
        const hiddenTooltip = hasOtherTooltip && selectedFeatures.length === 1;

        properties.oltb.tooltip.getElement().className = `oltb-overlay-tooltip ${hiddenTooltip ? 'oltb-overlay-tooltip--hidden' : ''}`;
        properties.oltb.onChangeListener = feature.getGeometry().on(Events.openLayers.change, this.onFeatureChange.bind(this, feature));
    }

    detachOnChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();
        
        if(Boolean(hasOtherTooltip) && selectedFeatures.length === 1) {
            TooltipManager.pop(KEY_TOOLTIP);
        }

        const properties = feature.getProperties();
        const geometry = feature.getGeometry();

        unByKey(properties.oltb.onChangeListener);

        const overlay = properties.oltb.tooltip;
        overlay.setPosition(getMeasureCoordinates(geometry));

        const tooltip = overlay.getElement();
        tooltip.className = 'oltb-overlay-tooltip';

        const measureValue = getMeasureValue(geometry);
        tooltip.firstElementChild.innerHTML = `${measureValue.value} ${measureValue.unit}`;
    }

    onFeatureChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();

        const geometry = feature.getGeometry();
        const measureValue = getMeasureValue(geometry);

        if(Boolean(hasOtherTooltip) && selectedFeatures.length === 1) {
            this.tooltipItem.innerHTML = `${measureValue.value} ${measureValue.unit}`;
        }else {
            const overlay = feature.getProperties().oltb.tooltip;
            overlay.setPosition(getMeasureCoordinates(geometry));

            const tooltip = overlay.getElement();
            tooltip.firstElementChild.innerHTML = `${measureValue.value} ${measureValue.unit}`;
        }
    }

    deSelect() {
        this.deActivateTool();
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
        }
        
        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        [
            this.select,
            this.translate,
            this.modify
        ].forEach((item) => {
            map.addInteraction(item);
        });

        ToolManager.setActiveTool(this);

        this.active = true;
        this.uiRefEditToolbox.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        [
            this.select,
            this.translate,
            this.modify
        ].forEach((item) => {
            this.getMap().removeInteraction(item);
        });

        ToolManager.removeActiveTool();

        this.active = false;
        this.uiRefEditToolbox.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }
}

export { EditTool };