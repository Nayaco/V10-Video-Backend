import * as redis from 'redis';
import * as bluebird from 'bluebird';
import {RedisClient} from 'redis';
import { redis_interface, hb_interface } from '../interfaces';
bluebird.promisifyAll(redis);

class HeartbeatService{
    client: RedisClient;
    _redisconfig: redis_interface;
    
    constructor(redis_conf: redis_interface){
        this._redisconfig = redis_conf;
        this.client = redis.createClient({
            host: this._redisconfig.host,
            port: this._redisconfig.port,
            password: this._redisconfig.passwd
        })
    }

    async reg(usr: string, file: string){

    }

    async status(usr: string, file: string){

    }

    async unreg(){

    }
}