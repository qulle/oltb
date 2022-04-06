const URIGet = function(name) {
    const urlSearchParameters = decodeURI(window.location.search);
    const urlObject = new URLSearchParams(urlSearchParameters);
    const parameter = (urlObject.get(name) || '') === 'true';

    return parameter;
}

export { URIGet };