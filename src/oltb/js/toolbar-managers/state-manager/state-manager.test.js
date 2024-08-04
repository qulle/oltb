import { jest, describe, it, expect } from '@jest/globals';
import { StateManager } from './state-manager';
import { LogManager } from '../log-manager/log-manager';

const FILENAME = 'state-manager.js';

describe('StateManager', () => {
    it('should init the manager', async () => {
        return StateManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(StateManager, 'setMap');
        const map = {};

        StateManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(StateManager.getName()).toBe(FILENAME);
    });

    it('should have three ignored keys', () => {
        expect(StateManager.getIgnoredKeys().length).toBe(3);
        expect(StateManager.getIgnoredKeys()[0]).toBe('marker');
        expect(StateManager.getIgnoredKeys()[1]).toBe('tooltip');
        expect(StateManager.getIgnoredKeys()[2]).toBe('onChangeListener');
    });

    it('should not have state-object for [jest]', () => {
        expect(StateManager.getStateObject('jest')).toStrictEqual({});
    });

    it('should set state-object for [jest]', () => {
        StateManager.setStateObject('jest', {
            state: true,
            method: 'foobar'
        });

        expect(StateManager.getStateObject('jest')).toStrictEqual({
            state: true,
            method: 'foobar'
        });
    });

    it('should get-and-merge empty object with stored [jest] object', () => {
        const state = StateManager.getAndMergeStateObject('jest', {});
        expect(state).toStrictEqual({
            state: true,
            method: 'foobar'
        });
    });

    it('should get-and-merge object with stored [jest] object', () => {
        const state = StateManager.getAndMergeStateObject('jest', {
            extra: 'abc'
        });

        expect(state).toStrictEqual({
            state: true,
            method: 'foobar',
            extra: 'abc'
        });
    });

    // TODO:
    // Is this behaviour correct, that clear also fetches the saved state?
    it('should clear state', () => {
        const spyOnLogDebug = jest.spyOn(LogManager, 'logDebug');
        StateManager.clear();

        expect(spyOnLogDebug).toHaveBeenCalled();
    });
});