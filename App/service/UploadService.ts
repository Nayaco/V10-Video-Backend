import * as fs from 'fs-extra';
import { PathLike } from 'fs-extra';
import * as Crypto from 'crypto'
import * as redis from 'redis';
import {RedisClient} from 'redis';
import {redis_interface, sql_interface} from  '../interfaces'

class UploadService {
    _resource: string
    _redisconfig: redis_interface;
    _sqlconfig: sql_interface;
    client: RedisClient;

    constructor(resource: string ,redis_conf: redis_interface, sql_conf?: sql_interface){
        this._resource = resource;
        this._redisconfig = redis_conf;
        this._sqlconfig = sql_conf;
        this.client = redis.createClient({
            host: this._redisconfig.host,
            port: this._redisconfig.port,
            password: this._redisconfig.passwd
        })
    }
    
    get Resource(): string{
        return this._resource;
    }
    set Resource(resource: string){
        this._resource = resource;
    }
    
    async StoreFile(file: PathLike){
        return new Promise((resolve,reject) =>{
            const Source = fs.createReadStream(file)
            const Dst = fs.createWriteStream(this._resource, {flags: 'a'})
            Source.pipe(Dst)
            .on('error', (err)=>{reject(err)})
            .on('finish', ()=>{resolve(true)})
        })
    }

}

