import { beforeAll, describe, it, expect } from '@jest/globals';
import { createUICheckbox } from './create-ui-checkbox';

describe('CreateUICheckbox', () => {
    let uiCheckbox = undefined;

    beforeAll(() => {
        uiCheckbox = createUICheckbox({
            idPrefix: 'pre',
            idPostfix: 'post',
            text: 'Toggle setting',
            checked: true
        });
    });
      
    it('should create a ui-checkbox', () => {
        expect(uiCheckbox).toBeTruthy();
        expect(uiCheckbox.length).toBe(2);
    });

    it('should contain one DIV and one INPUT', () => {
        const [ wrapper, checkbox ] = uiCheckbox;
        expect(wrapper.nodeName).toBe('DIV');
        expect(checkbox.nodeName).toBe('INPUT');
    });

    it('should be two childs in the wrapper of type INPUT and LABEL', () => {
        const wrapper = uiCheckbox[0];
        expect(wrapper.childNodes.length).toBe(2);
        expect(wrapper.childNodes[0].nodeName).toBe('INPUT');
        expect(wrapper.childNodes[1].nodeName).toBe('LABEL');
    });

    it('should be a checked checkbox', () => {
        const checkbox = uiCheckbox[1];
        expect(checkbox.hasAttribute('checked')).toBe(true);
        expect(checkbox.getAttribute('checked')).toBe('');
    });
});