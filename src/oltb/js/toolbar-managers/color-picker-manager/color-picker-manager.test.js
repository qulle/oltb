import { jest, describe, it, expect } from '@jest/globals';
import * as AColorPicker from 'a-color-picker';
import { ColorPickerManager } from './color-picker-manager';

const FILENAME = 'color-picker-manager.js';

describe('ColorPickerManager', () => {
    it('should init the manager', async () => {
        return ColorPickerManager.initAsync({}).then((result) => {
            expect(AColorPicker.createPicker).toHaveBeenCalled();
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spy = jest.spyOn(ColorPickerManager, 'setMap');
        const map = {};

        ColorPickerManager.setMap(map);
        expect(spy).toHaveBeenCalled();
        expect(ColorPickerManager.getName()).toBe(FILENAME);
    });

    it('should return truthy color-picker-instance', () => {
        expect(ColorPickerManager.getColorPicker()).toBeTruthy();
    });

    it('should return truthy color-picker-element', () => {
        expect(ColorPickerManager.getColorPickerElement()).toBeTruthy();
    });

    it('should return truthy color-picker-element', () => {
        const element = ColorPickerManager.getColorPickerElement();

        expect(element).toBeTruthy();
        expect(element.nodeName).toBe('DIV');
        expect(element.getAttribute('id')).toBe('otlb-color-picker');
        expect(element.getAttribute('class')).toBe('oltb-mt-05 oltb-mb-0313');
        expect(element.getAttribute('acp-color')).toBe('#D7E3FA');
        expect(element.getAttribute('acp-show-alpha')).toBe('yes');
        expect(element.getAttribute('acp-show-rgb')).toBe('no');
        expect(element.getAttribute('acp-show-hsl')).toBe('no');
        expect(element.getAttribute('acp-show-hex')).toBe('yes');
    });
});