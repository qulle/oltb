import { jest, describe, it, expect } from '@jest/globals';
import { TooltipManager } from './tooltip-manager';

const FILENAME = 'tooltip-manager.js';

describe('TooltipManager', () => {
    it('should init the manager', async () => {
        return TooltipManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(TooltipManager, 'setMap');
        const map = {};

        TooltipManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(TooltipManager.getName()).toBe(FILENAME);
    });

    it('should contain zero tooltips', () => {
        expect(TooltipManager.isEmpty()).toBe(true);
        expect(TooltipManager.getTooltips()).toStrictEqual({});
    });

    it('should create a tooltip with key [jest]', () => {
        const key = 'jest';
        const map = {
            on: (event, callback) => {},
            addOverlay: (overlay) => {},
            removeOverlay: (overlay) => {}
        };

        TooltipManager.setMap(map);
        const tooltipPush = TooltipManager.push(key);

        expect(tooltipPush.nodeName).toBe('SPAN');
        expect(tooltipPush.className).toBe('oltb-overlay-tooltip__item');
        expect(TooltipManager.getSize()).toBe(1);

        const tooltipGet = TooltipManager.getTooltip(key);
        expect(tooltipGet).toBeTruthy();

        const tooltipPop = TooltipManager.pop(key);
        expect(tooltipPop).toStrictEqual(tooltipPush);
        expect(TooltipManager.getSize()).toBe(0);

        expect(tooltipGet).toEqual(tooltipPush);
        expect(tooltipGet).toEqual(tooltipPop);
    });
});