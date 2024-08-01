import { jest, describe, it, expect } from '@jest/globals';
import { ToolManager } from './tool-manager';

const FILENAME = 'tool-manager.js';

describe('ToolManager', () => {
    it('should init the manager', async () => {
        return ToolManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(ToolManager, 'setMap');
        const map = {};

        ToolManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(ToolManager.getName()).toBe(FILENAME);
    });

    it('should not have a active tool', () => {
        expect(ToolManager.getActiveTool()).toBeUndefined();
        expect(ToolManager.hasActiveTool()).toBe(false);
    });

    it('should set dummy tool as active', () => {
        const toolOne = {
            name: 'Jest',
            deselectTool: () => {}
        };

        const toolTwo = {
            name: 'Jest',
            deselectTool: () => {}
        };

        ToolManager.setActiveTool(toolOne);
        expect(ToolManager.getActiveTool()).toBe(toolOne);
        expect(ToolManager.hasActiveTool()).toBe(true);

        const spyOne = jest.spyOn(toolOne, 'deselectTool');
        const spyTwo = jest.spyOn(toolTwo, 'deselectTool');

        ToolManager.setActiveTool(toolTwo);
        expect(ToolManager.getActiveTool()).toBe(toolTwo);
        expect(ToolManager.hasActiveTool()).toBe(true);
        expect(spyOne).toHaveBeenCalled();

        ToolManager.removeActiveTool();
        expect(ToolManager.getActiveTool()).toBeUndefined();
        expect(ToolManager.hasActiveTool()).toBe(false);
        expect(spyTwo).not.toHaveBeenCalled();
    });
});