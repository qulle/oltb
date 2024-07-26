import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { ContextMenuTool } from './context-menu-tool';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'context-menu-tool.js';
const CLASS__CONTEXT_MENU = 'oltb-context-menu';

const mockView = {
    animate: (options) => {},
    cancelAnimations: () => {},
    getAnimating: () => true,
    getZoom: () => 1.234,
    getProjection: () => 'jest',
    getCenter: () => [1.123, 2.456],
    getRotation: () => 1.234,
    getConstrainedZoom: (zoom) => 1
};

const mockMap = {
    addLayer: (layer) => {},
    removeLayer: (layer) => {}, 
    addInteraction: (interaction) => {},
    removeInteraction: (interaction) => {},
    addOverlay: (overlay) => {},
    removeOverlay: (overlay) => {},
    on: (event, callback) => {},
    getEventCoordinate: () => [1.123, 2.456],
    getView: () => {
        return mockView;
    }
};

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('ContextMenuTool', () => {
    const initToolInstance = (options) => {
        return new ContextMenuTool(options);;
    }

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ContextMenuTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = initToolInstance();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ContextMenuTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should show the context-menu', () => {
        const tool = initToolInstance();

        EventManager.dispatchEvent([tool.uiRefMapElement], 'contextmenu');
        expect(tool.menu.classList.contains(`${CLASS__CONTEXT_MENU}--show`)).toBe(true);
    });

    it('should show and hide the context-menu', () => {
        const tool = initToolInstance();

        EventManager.dispatchEvent([tool.uiRefMapElement], 'contextmenu');
        
        expect(tool.menu.classList.contains(`${CLASS__CONTEXT_MENU}--show`)).toBe(true);
        simulateKeyPress('keyup', tool.uiRefMapElement, 'Escape');
        expect(tool.menu.classList.contains(`${CLASS__CONTEXT_MENU}--show`)).toBe(false);
    });

    it('should add a item to the context menu', () => {
        const tool = initToolInstance();
        const item = tool.addMenuItem({
            icon: 'jest-icon',
            i18nKey: 'jest-key',
            fn: () => {}
        });

        expect(item).toBeTruthy();
        expect(item.nodeName).toBe('LI');
        expect(item.classList.contains(`${CLASS__CONTEXT_MENU}__item`)).toBe(true);
    });

    it('should add a item to the context menu that was added through the static interface', () => {
        const itemOne = {
            icon: 'jest-icon-one',
            i18nKey: 'jest-key-one',
            fn: () => {}
        };

        const itemTwo = {
            icon: 'jest-icon-two',
            i18nKey: 'jest-key-two',
            fn: () => {}
        }
        
        ContextMenuTool.addItem(itemOne);
        const tool = initToolInstance();
        tool.addMenuItem(itemTwo);

        expect(tool.getSize()).toBe(2);
    });

    it('should add a separator-item to the context menu', () => {
        const tool = initToolInstance();
        const item = tool.addMenuItem({});

        expect(item).toBeTruthy();
        expect(item.nodeName).toBe('LI');
        expect(item.classList.contains(`${CLASS__CONTEXT_MENU}__divider`)).toBe(true);
    });

    it('should trigger item callback', () => {
        const tool = initToolInstance();
        const callbacks = {onClick: () => {}};
        const spyOnOnClick = jest.spyOn(callbacks, 'onClick');
        const item = tool.addMenuItem({
            icon: 'jest-icon',
            i18nKey: 'jest-key',
            fn: callbacks.onClick
        });

        item.click();
        expect(spyOnOnClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger item callback using Enter-key', () => {
        const tool = initToolInstance();
        const callbacks = {onClick: () => {}};
        const spyOnOnClick = jest.spyOn(callbacks, 'onClick');
        const item = tool.addMenuItem({
            icon: 'jest-icon',
            i18nKey: 'jest-key',
            fn: callbacks.onClick
        });

        simulateKeyPress('keyup', item, 'Enter');
        expect(spyOnOnClick).toHaveBeenCalledTimes(1);
    });
});