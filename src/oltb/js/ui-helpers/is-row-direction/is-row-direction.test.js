import { describe, it, expect } from '@jest/globals';
import { isHorizontal } from './is-row-direction';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';

describe('isHorizontal', () => {
    it('should not be horizontal mode', () => {
        expect(isHorizontal()).toEqual(false);
    });

    it('should be horizontal mode', () => {
        window.document.body.classList.add(ConfigManager.getConfig().className.row)
        expect(isHorizontal()).toEqual(true);
    });
});