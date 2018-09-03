import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { redis_interface } from '../interfaces';

class HeartbeatService{
    expire: number;
    client: RedisClient;
    _redisconfig: redis_interface;
    redisHmset: any;
    redisHgetall: any;
    redisListkeys:any;
    redisDel: any;

    constructor(redis_conf: redis_interface, expire: number){
        this.expire = expire;
        this._redisconfig = redis_conf;
        this.client = redis.createClient({
            host: this._redisconfig.host,
            port: this._redisconfig.port,
            password: this._redisconfig.passwd
        });
        this.redisHgetall = bluebird.promisify(this.client.hgetall).bind(this.client);
        this.redisHmset = bluebird.promisify(this.client.hmset).bind(this.client);
        this.redisListkeys = bluebird.promisify(this.client.keys).bind(this.client);
        this.redisDel = bluebird.promisify(this.client.del).bind(this.client);
    };

    /** 
    * @param {string} key
    * @param {object} payload
    * @return {string, hb_interface} 
    */
    async reg(key: string, payload: object){
       const now = (new Date()).getTime() / 1000;
       const state = await this.redisHmset(key, payload);
       
    }

    /** 
    * @param {string} file
    * @return {stringboolean, hb_interface} 
    */
    async getStatus(file: string){
        const status:any = await this.redisHgetall(file);
        const ans = {
            usr: status.usr,
            file: status.file,
            time: status.time,
            status: status.status,
        }; 
        return status;
    }

    /** 
    * @param {string} file
    * @param {string} command - Command to implement with this info
    * @return {stringboolean, hb_interface} 
    */
    async renew(file: string, command: string){
        const now = (new Date()).getTime() / 1000;
        if(command == 'STOP'){
            const old_status = await this.getStatus(file);
            const new_status = {
                usr: old_status.usr, 
                time: now,
                count: old_status.count + 1,
                status: 'N',
            };
            this.redisHmset();
        }
        
    }

    async unreg(file: string){
        const state = this.redisDel(file);
        
    }
};

export default HeartbeatService;