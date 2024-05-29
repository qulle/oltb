import _ from 'lodash';
import { Animals } from './animals';
import { Adjectives } from './adjectives';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';

const FILENAME = 'name-manager.js';
const INDEX__OFFSET = 1;

/**
 * About:
 * NameManager
 * 
 * Description:
 * Manager responsilbe for generating a random name.
 */
class NameManager extends BaseManager {
    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static generate() {
        const animalIndex = _.random(0, Animals.length - INDEX__OFFSET);
        const adjectiveIndex = _.random(0, Adjectives.length - INDEX__OFFSET);
        
        return (`${Adjectives[adjectiveIndex]} ${Animals[animalIndex]}`).capitalize();
    }
}

export { NameManager };