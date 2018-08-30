import * as moment from 'moment';
import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { redis_interface, hb_interface } from '../interfaces';

class HeartbeatService{
    client: RedisClient;
    _redisconfig: redis_interface;
    redisHmset: any;
    redisHgetall: any;
    redisListkeys:any;
    constructor(redis_conf: redis_interface){
        this._redisconfig = redis_conf;
        this.client = redis.createClient({
            host: this._redisconfig.host,
            port: this._redisconfig.port,
            password: this._redisconfig.passwd
        });
        this.redisHgetall = bluebird.promisify(this.client.hgetall).bind(this.client);
        this.redisHmset = bluebird.promisify(this.client.hmset).bind(this.client);
        this.redisListkeys = bluebird.promisify(this.client.keys).bind(this.client);
    }

    async reg(usr: string, file: string){
        const now = (new Date()).getTime() / 1000;
        await this.client.hmset(file, {
            usr: usr,
            time: now,
            count: 0,
            status: 'N',
        });
    }

    async status(file: string){
        const status:any = await this.redisHgetall(file);
        const ans = {
            usr: status.usr,
            file: status.file,
            time: status.time,
            status: status.status,
        } 
        return status;
    }

    async unreg(){

    }
}