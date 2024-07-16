import { describe, it, expect } from '@jest/globals';
import { createUIInput } from './create-ui-input';

describe('createUIInput', () => {
    it('should create a ui-input', () => {
        const uiInput = createUIInput();

        expect(uiInput).toBeTruthy();
        expect(uiInput.length).toBe(2);
    });

    it('should contain one DIV and one INPUT', () => {
        const uiInput = createUIInput({
            idPrefix: 'pre',
            idPostfix: 'post',
        });
        const [ wrapper, checkbox ] = uiInput;

        expect(checkbox.getAttribute('id')).toBe('prepost');
        expect(wrapper.nodeName).toBe('DIV');
        expect(checkbox.nodeName).toBe('INPUT');
    });

    it('should be two childs in the wrapper of type LABEL and INPUT', () => {
        const uiInput = createUIInput({});
        const wrapper = uiInput[0];

        expect(wrapper.childNodes.length).toBe(2);
        expect(wrapper.childNodes[0].nodeName).toBe('LABEL');
        expect(wrapper.childNodes[1].nodeName).toBe('INPUT');
    });

    it('should be a label with text "User input expected"', () => {
        const uiInput = createUIInput({
            text: 'User input expected'
        });
        const wrapper = uiInput[0];
        const label = wrapper.childNodes[0];

        expect(label.innerText).toBe('User input expected');
    });
});