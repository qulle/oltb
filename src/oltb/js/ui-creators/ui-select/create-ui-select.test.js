import { beforeAll, describe, it, expect } from '@jest/globals';
import { createUISelect } from "./create-ui-select";

describe('CreateUISelect', () => {
    let uiSelect = undefined;

    beforeAll(() => {
        uiSelect = createUISelect({
            idPrefix: 'pre',
            idPostfix: 'post',
            text: 'User selection expected',
            options: [
                {text: 'Lord Of The Rings', value: 'lotr'},
                {text: 'Game Of Thrones', value: 'got'},
                {text: 'Harry Potter', value: 'hp'}
            ],
            value: 'hp'
        });
    });
      
    it('should create a ui-select', () => {
        expect(uiSelect).toBeTruthy();
        expect(uiSelect.length).toBe(2);
    });

    it('should contain one DIV and one SELECT', () => {
        const [ wrapper, select ] = uiSelect;

        expect(wrapper.nodeName).toBe('DIV');
        expect(select.nodeName).toBe('SELECT');
    });

    it('should be two childs in the wrapper of type LABEL and SELECT', () => {
        const wrapper = uiSelect[0];
        expect(wrapper.childNodes.length).toBe(2);
        expect(wrapper.childNodes[0].nodeName).toBe('LABEL');
        expect(wrapper.childNodes[1].nodeName).toBe('SELECT');
    });

    it('should be a label with text "User selection expected"', () => {
        const wrapper = uiSelect[0];
        const label = wrapper.childNodes[0];
        expect(label.innerText).toBe('User selection expected');
    });

    it('should contain three options with "hp" selected', () => {
        const select = uiSelect[1];
        expect(select.childNodes.length).toBe(3);
        expect(select.value).toBe('hp');
    });
});