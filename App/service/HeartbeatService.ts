import * as moment from 'moment';
import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
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
        });
    }

    async reg(usr: string, file: string){
        const now = moment().format('')
        await this.client.hmset(file, {
            usr: usr,
            time: now,
            count: 0,
            status: 'N',
        });
    }

    async status(file: string){
        const status:any = await this.client.hgetall(file);
        /*const ans = {
            usr: status.usr,
            file: status.file,
            time: status.time,
            status: status.status,
        }*/ 
        return ans;
    }

    async unreg(){

    }
}