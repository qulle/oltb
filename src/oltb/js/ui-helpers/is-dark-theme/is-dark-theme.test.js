import { describe, it, expect } from '@jest/globals';
import { isDarkTheme } from './is-dark-theme';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';

describe('isDarkTheme', () => {
    it('should not be dark theme', () => {
        expect(isDarkTheme()).toEqual(false);
    });

    it('should be dark theme', () => {
        window.document.body.classList.add(ConfigManager.getConfig().className.dark)
        expect(isDarkTheme()).toEqual(true);
    });
});