import { beforeAll, describe, it, expect } from '@jest/globals';
import { createUITooltip } from "./create-ui-tooltip";

describe('CreateUITooltip', () => {
    let uiTooltip = undefined;

    beforeAll(() => {
        uiTooltip = createUITooltip('Initial Tooltip');
    });
      
    it('should create a ui-tooltip', () => {
        expect(uiTooltip).toBeTruthy();
    });

    it('should contain a ol-overlay with a DIV', () => {
        expect(uiTooltip.getOverlay().getElement().nodeName).toBe('DIV');
    });

    it('should get data "Initial Tooltip"', () => {
        expect(uiTooltip.getData()).toBe('Initial Tooltip');
    });

    it('should set data from "Initial Tooltip" to "New Tooltip"', () => {
        expect(uiTooltip.getData()).toBe('Initial Tooltip');
        uiTooltip.setData('New Tooltip');
        expect(uiTooltip.getData()).toBe('New Tooltip');
    });

    it('should set position from "undefined" to [0, 0]', () => {
        expect(uiTooltip.getPositioin()).toBe(undefined);
        uiTooltip.setPosition([0, 0]);
        expect(uiTooltip.getPositioin()).toStrictEqual([0, 0]);
    });
});