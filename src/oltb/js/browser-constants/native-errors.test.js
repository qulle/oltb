import { describe, it, expect } from '@jest/globals';
import { NativeErrors } from './native-errors';

describe('NativeErrors', () => {
    const sut = Object.freeze({
        evalError: 'EvalError',
        internalError: 'InternalError',
        rangeError: 'RangeError',
        referenceError: 'ReferenceError',
        syntaxError: 'SyntaxError',
        typeError: 'TypeError',
        uriError: 'URIError'
    });

    it('should have the same structure as the runtime-object', () => {
        expect(NativeErrors).toStrictEqual(sut);
    });
});
