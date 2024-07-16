import { describe, it, expect } from '@jest/globals';
import { createUITooltip } from './create-ui-tooltip';

describe('createUITooltip', () => {
    it('should create a ui-tooltip', () => {
        const uiTooltip = createUITooltip();
        expect(uiTooltip).toBeTruthy();
    });

    it('should contain a ol-overlay with a DIV', () => {
        const uiTooltip = createUITooltip('Initial Tooltip');
        expect(uiTooltip.getOverlay().getElement().nodeName).toBe('DIV');
    });

    it('should get data "Initial Tooltip"', () => {
        const uiTooltip = createUITooltip('Initial Tooltip');
        expect(uiTooltip.getData()).toBe('Initial Tooltip');
    });

    it('should set data from "Initial Tooltip" to "New Tooltip"', () => {
        const uiTooltip = createUITooltip('Initial Tooltip');
        expect(uiTooltip.getData()).toBe('Initial Tooltip');
        uiTooltip.setData('New Tooltip');
        expect(uiTooltip.getData()).toBe('New Tooltip');
    });

    it('should set position from "undefined" to [0, 0]', () => {
        const uiTooltip = createUITooltip('Initial Tooltip');
        expect(uiTooltip.getPositioin()).toBe(undefined);
        uiTooltip.setPosition([0, 0]);
        expect(uiTooltip.getPositioin()).toStrictEqual([0, 0]);
    });
});