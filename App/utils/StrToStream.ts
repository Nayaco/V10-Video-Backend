import { Stream, PassThrough, Readable, Writable} from 'stream';

/**
* @param {String} str - The string you want to convert
* @param {string} [flag] - String['r'|'d'] (The stream you want to convert to, default is 'r'
* @return {Readable|Duplex} - The stream you need
*
* @example
*   import * as s2s from 'path-to-this-file';
*   const stream = s2s('I am a cow', 'r');
*/
const Str2Stream = (str: String, flag?: String):Stream =>{
    switch(flag){
        case 'r': {
            var output = new PassThrough();
            output.write(str);
            output.end();
            return output;        
        }
        case 'd': {
            var output = new PassThrough();
            output.write(str);
            return output;
        }
        default: {
            var output = new PassThrough();
            output.write(str);
            return output;
        }
    
    } 
}

export default Str2Stream;