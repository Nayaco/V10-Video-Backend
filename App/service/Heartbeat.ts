import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { redis_interface } from '../interfaces';

type EXPIRE_INFO = {code: 0|1|2, info: 'ONLINE'|'EXPIRED'|'OFFLINE'} | null;

/**
 * @param {number}code
 * @return {EXPIRE_INFO} - loooook above
 */
function makeExpireInfo(code: number): EXPIRE_INFO{
    switch(code){
        case 0: return {code: 0, info: 'ONLINE'};
        case 1: return {code: 1, info: 'EXPIRED'};
        case 2: return {code: 2, info: 'OFFLINE'};
        default: return null;
    }
}

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
    * @return {string} - state 
    */
    async reg(key: string, payload: object){
        const now = (new Date()).getTime() / 1000;
        const value = {...payload, time: now, state: 'ONLINE'};
        const state = await this.redisHmset(key, value);
        if(state == 'OK')return 'OK';
            else return 'FAILED';
    }

    /** 
    * @param {string} key
    * @return {object} - object
    */
    async getValue(key: string){
        const value = await this.redisHgetall(key);
        return value;
    }

    /** 
    * @param {string} key
    * @return {string} -expire status 
    */
    async checkExpire(key: string, now: number = (new Date()).getTime() / 1000){
        const value = await this.redisHgetall(key);
        const lastChange = value.time;
        if(now - lastChange >= this.expire && value.state == 'ONLINE'){
            return makeExpireInfo(1);
        }else if(value.state == 'OFFLINE'){
            return makeExpireInfo(2);
        }else{
            return makeExpireInfo(0);
        }
    }

    /** 
    * @param {string} key 
    * @param {object} payload
    * @return {string, object} - update status & update content
    */
    async update(key: string, command: string = 'UPDATE'){
        const now = (new Date()).getTime() / 1000;
        const expireStatus = await this.checkExpire(key, now);
        const rawValue = await this.getValue(key);
        if(expireStatus == ){
            if(command == 'UPDATE'){
                const newValue = {...rawValue, time: now, };
            }
        }
        
    }

    async unreg(file: string){
        const state = this.redisDel(file);
        
    }
};

export {
    EXPIRE_INFO,
    HeartbeatService, 
}