import _ from 'lodash';
import { SvgPaths } from './svg-paths';

const DefaultOptions = Object.freeze({
    path: SvgPaths.airplane.stroked,
    width: 24,
    height: 24,
    fill: 'currentColor',
    stroke: '#FFFFFFFF',
    strokeWidth: 0,
    shouldReplaceHashtag: false,
    class: ''
});

const getSvgIcon = function(options = {}) {
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
            class="${options.class}" 
            viewBox="0 0 16 16">
            ${options.path}
        </svg>
    `);
}

// Note:
// Re-exporting the SvgPaths as they are often ues with the getSvgIcon
// and can be imported together by the consumer
export { SvgPaths, getSvgIcon };