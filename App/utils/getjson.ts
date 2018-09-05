import * as fs from 'fs-extra';
import { PathLike } from 'fs-extra';

const getJSON = (path:PathLike):object =>{
    const JsonString = fs.readFileSync(path).toString();
    return JSON.parse(JsonString); 
}