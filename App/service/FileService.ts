import * as fs from 'fs-extra';
import { PathLike } from 'fs-extra';
import * as Crypto from 'crypto';
import * as path from 'path';

class FileService {
    _resource: string;

    constructor(resource: string = path.resolve(__dirname, '..', '..' + '/assets')){
        this._resource = resource;
    }
    
    get Resource(): string{
        return this._resource;
    }
    set Resource(resource: string){
        this._resource = resource;
    }
    
    StoreFile(file: PathLike, filename: string){
        return new Promise((resolve,reject) =>{
            const Source = fs.createReadStream(file);
            const Dst = fs.createWriteStream(`${this._resource}/${filename}`, {flags: 'a'});
            Source.pipe(Dst)
            .on('error', (err)=>{reject(err)})
            .on('finish', ()=>{resolve(true)});
        });
    }

    GetHash(file: PathLike){
        return new Promise((resolve,reject) =>{
            const Source = fs.createReadStream(file);
            const Hash =  Crypto.createHash('sha256');
            Source.pipe(Hash)
            .on('error', (err)=>{reject(err)})
            .on('finish', ()=>{resolve(Hash.digest('hex'))});
        }) 
    }

    async Del(file: string){
        try{
            await fs.remove(file);
        }catch(err){
            throw err;
        }
    }

}

export { FileService };
