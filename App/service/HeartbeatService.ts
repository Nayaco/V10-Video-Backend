import * as redis from 'redis';
import {RedisClient} from 'redis';
import { redis_interface } from '../interfaces';

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

    async sign(){
        
    }
}