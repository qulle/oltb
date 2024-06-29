import { jest, describe, it, expect } from '@jest/globals';
import { eventDispatcher } from "./event-dispatcher";

describe('EventDispatcher', () => {
    it('should dispatch onChange event for select-element', () => {
        const callbacks = {onChange: () => {}};
        const spy = jest.spyOn(callbacks, 'onChange');
        
        const select = window.document.createElement('select');
        select.addEventListener('change', callbacks.onChange)

        eventDispatcher([select], 'change');
        expect(spy).toHaveBeenCalledTimes(1);
    });
});