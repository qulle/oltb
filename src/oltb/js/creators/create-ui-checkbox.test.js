import { describe, it, expect } from '@jest/globals';
import { createUICheckbox } from "./create-ui-checkbox";

describe('CreateUiCheckbox', () => {
    it('should create a ui-checkbox', () => {
        const uiCheckbox = createUICheckbox({
            idPrefix: 'uiPrefix',
            idPostfix: 'uiPostfix',
            text: 'Toggle',
            checked: false
        });

        expect(uiCheckbox.length).toBe(2);
    });
});