import { beforeAll, describe, it, expect } from '@jest/globals';
import { createUIColorInput } from './create-ui-color-input';

describe('CreateUIColorInput', () => {
    let uiColorInput = undefined;

    beforeAll(() => {
        uiColorInput = createUIColorInput({
            idPrefix: 'pre',
            idPostfix: 'post',
            text: 'User selection expected',
            color: '#0099FF'
        });
    });
      
    it('should create a ui-color-input', () => {
        expect(uiColorInput).toBeTruthy();
        expect(uiColorInput.length).toBe(2);
    });

    it('should contain two DIV', () => {
        const [ wrapper, input ] = uiColorInput;
        expect(wrapper.nodeName).toBe('DIV');
        expect(input.nodeName).toBe('DIV');
    });

    it('should be two childs in the wrapper of type LABEL and DIV', () => {
        const wrapper = uiColorInput[0];
        expect(wrapper.childNodes.length).toBe(2);
        expect(wrapper.childNodes[0].nodeName).toBe('LABEL');
        expect(wrapper.childNodes[1].nodeName).toBe('DIV');
    });

    it('should be a label with text "User selection expected"', () => {
        const wrapper = uiColorInput[0];
        const label = wrapper.childNodes[0];
        expect(label.innerText).toBe('User selection expected');
    });

    it('should contain hex color #0099FF', () => {
        const input = uiColorInput[1];
        expect(input.getAttribute('data-oltb-color')).toBe('#0099FF');
    });
});