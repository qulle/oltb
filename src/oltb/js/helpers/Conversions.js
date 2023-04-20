const FILENAME = 'helpers/Conversions.js';

const roundToNearest = function(value, nearest) {
    return Math.round(value / nearest) * nearest;
}

const roundUpToNearest = function(value, nearest) {
    return Math.ceil(value / nearest) * nearest;
}

const roundDownToNearest = function(value, nearest) {
    return Math.floor(value / nearest) * nearest;
}

const degreesToRadians = function(degrees) {
    return degrees * (Math.PI / 180);
}

const radiansToDegrees = function(radians) {
    return radians * (180 / Math.PI);
}

const metersPerSecondToKnots = function(mps) {
    return mps * 1.943844;
}

const knotsToMetersPerSecond = function(knots) {
    return knots * 0.514444;
}

export {
    roundToNearest,
    roundUpToNearest,
    roundDownToNearest,
    degreesToRadians,
    radiansToDegrees,
    metersPerSecondToKnots,
    knotsToMetersPerSecond
}