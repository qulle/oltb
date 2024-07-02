import { describe, it, expect } from '@jest/globals';
import { FullscreenEvents, FullscreenEventTypes } from './fullscreen-handler';

describe('FullscreenHandler', () => {
    const sutOne = Object.freeze([
        'fullscreenchange',
        'webkitfullscreenchange',
        'MSFullscreenChange'
    ]);

    const sutTwo = Object.freeze({
        enterFullScreen: 'enterfullscreen',
        leaveFullScreen: 'leavefullscreen'
    });

    it('should have the same structures as the runtime-objects', () => {
        expect(FullscreenEvents).toStrictEqual(sutOne);
        expect(FullscreenEventTypes).toStrictEqual(sutTwo);
    });
});
