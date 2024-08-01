import _ from 'lodash';
import { SvgPaths } from './svg-paths';
import { ConversionManager } from '../../toolbar-managers/conversion-manager/conversion-manager';

const getSvgPath = function(windSpeed) {
    // Note: 
    // Base case that breaks the pattern of 2.5 m/s steps
    if(windSpeed >= 1.0  && windSpeed < 2.5) {
        return SvgPaths.knot2;
    }

    const meterPerSecondStep = 2.5;
    const lowerMeterPerSecond = ConversionManager.roundDownToNearest(windSpeed, meterPerSecondStep);

    const knots = ConversionManager.metersPerSecondToKnots(lowerMeterPerSecond);

    const knotPerSecondStep = 5;
    const lowerKnotPerSecond = ConversionManager.roundToNearest(knots, knotPerSecondStep);
    
    const windBarbName = `knot${lowerKnotPerSecond}`;
    if(_.has(SvgPaths, [windBarbName])) {
        return SvgPaths[windBarbName];
    }

    return SvgPaths.knot0;
}

const DefaultOptions = Object.freeze({
    windSpeed: 0,
    width: 250,
    height: 250,
    fill: '#3B4352FF',
    stroke: '#3B4352FF',
    strokeWidth: 3,
    shouldReplaceHashtag: false
});

const getSvgWindBarb = function(options = {}) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

    // Note: 
    // HEX Colors are not valid in SVG 
    // Unless they are replaced with URL alternative char
    const ENCODED_HASHTAG = '%23';

    if(options.shouldReplaceHashtag) {   
        options.fill = options.fill.replace('#', ENCODED_HASHTAG);
        options.stroke = options.stroke.replace('#', ENCODED_HASHTAG);
    }

    return (`
        <svg xmlns="http://www.w3.org/2000/svg" 
            width="${options.width}" 
            height="${options.height}" 
            fill="${options.fill}"
            stroke="${options.stroke}"
            stroke-width="${options.strokeWidth}"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="10"
            viewBox="0 0 250 250">
            ${getSvgPath(options.windSpeed)}
        </svg>
    `);
}

// Note:
// Re-exporting the SvgPaths as they are often ues with the getSvgIcon
// and can be imported together by the consumer
export { SvgPaths, getSvgWindBarb };