import { describe, it, expect } from '@jest/globals';
import { DOMExceptions } from './dom-exceptions';

describe('DOMExceptions', () => {
    const sut = Object.freeze({
        abortError: 'AbortError',
        constraintError: 'ConstraintError',
        dataCloneError: 'DataCloneError',
        dataError: 'DataError',
        encodingError: 'EncodingError',
        hierarchyRequestError: 'HierarchyRequestError',
        inUseAttributeError: 'InUseAttributeError',
        indexSizeError: 'IndexSizeError',
        invalidAccessError: 'InvalidAccessError',
        invalidCharacterError: 'InvalidCharacterError',
        invalidModificationError: 'InvalidModificationError',
        invalidNodeTypeError: 'InvalidNodeTypeError',
        invalidStateError: 'InvalidStateError',
        namespaceError: 'NamespaceError',
        networkError: 'NetworkError',
        noModificationAllowedError: 'NoModificationAllowedError',
        notAllowedError: 'NotAllowedError',
        notFoundError: 'NotFoundError',
        notReadableError: 'NotReadableError',
        notSupportedError: 'NotSupportedError',
        operationError: 'OperationError',
        quotaExceededError: 'QuotaExceededError',
        readOnlyError: 'ReadOnlyError',
        securityError: 'SecurityError',
        syntaxError: 'SyntaxError',
        timeoutError: 'TimeoutError',
        unknownError: 'UnknownError',
        urlMismatchError: 'URLMismatchError',
        versionError: 'VersionError',
        wrongDocumentError: 'WrongDocumentError'
    });

    it('should have the same structure as the runtime-object', () => {
        expect(DOMExceptions).toStrictEqual(sut);
    });
});
