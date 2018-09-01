import * as fs from 'fs-extra';
import { PathLike } from 'fs-extra';
import * as Crypto from 'crypto';
import * as bluebird from 'bluebird';
import { sql_interface } from  '../interfaces'


class UploadService {
    _resource: string;
    _sqlconfig: sql_interface;

    constructor(resource: string ,sql_conf?: sql_interface){
        this._resource = resource;
        this._sqlconfig = sql_conf;
    }
    
    get Resource(): string{
        return this._resource;
    }
    set Resource(resource: string){
        this._resource = resource;
    }
    
    async StoreFile(file: PathLike){
        return new Promise((resolve,reject) =>{
            const Source = fs.createReadStream(file);
            const Dst = fs.createWriteStream(this._resource, {flags: 'a'});
            Source.pipe(Dst)
            .on('error', (err)=>{reject(err)})
            .on('finish', ()=>{resolve(true)});
        });
    }

    async GetHash(file: PathLike){
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

