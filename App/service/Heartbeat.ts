/* usr */
import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { redis_interface } from '../interfaces';

type EXPIRE_INFO = {code: 0, info: 'ONLINE'}|{code: 1, info: 'EXPIRED'}|null;
type USER_STAT = {code: 0, info: 'ONLINE'}|{code: 1, info: 'EXPIRED'}|{code: 2, info: 'REDIS FAILED'};

/**
 * @param {number}code
 * @return {EXPIRE_INFO} - loooook above
 */
function makeExpireInfo(code: number): EXPIRE_INFO{
    switch(code){
        case 0: return {code: 0, info: 'ONLINE'};
        case 1: return {code: 1, info: 'EXPIRED'};
        default: return null;
    }
}

/**
 * @param {number}code
 * @return {USER_STAT} - loooook above
 */
function makeUserStat(code: number): USER_STAT{
    switch(code){
        case 0: return {code: 0, info: 'ONLINE'};
        case 1: return {code: 1, info: 'EXPIRED'};
        case 2: return {code: 2, info: 'REDIS FAILED'};
    }
}

class Heartbeat{
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
    * @return {OK|FAILD} - state 
    */
    async reg(key: string, payload: object){
        const now = (new Date()).getTime() / 1000;
        const value = {...payload, time: now};
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
    * @return {EXPIRE_INFO} -expire status 
    */
    async checkExpire(key: string, now: number = (new Date()).getTime() / 1000){
        const value = await this.redisHgetall(key);
        const lastChange = value.time;
        if(now - lastChange >= this.expire){
            return makeExpireInfo(1);
        }else{
            return makeExpireInfo(0);
        }
    }

    /** 
    * @param {string} key 
    * @param {UPDATE|REFRESH} command
    * @param {object} payload
    * @return {USER_STAT} - update status
    */
    async update(key: string, payload:object = {}){
        const now = (new Date()).getTime() / 1000;
        const expireStatus = await this.checkExpire(key, now);
        let rawValue = await this.getValue(key);
        const lastChange = rawValue.time;
        rawValue = {...rawValue, ...payload};
        let newValue:any;

        if(expireStatus.code == 0){
            newValue = {...rawValue, time: now};
            const state = await this.redisHmset(key, newValue);
            if(state == 'OK')return makeUserStat(0);
                else return makeUserStat(2);
        }else{
            newValue = {...rawValue, time: now};
            const state = await this.redisHmset(key, newValue);
            if(state == 'OK')return makeUserStat(1);
                else return makeUserStat(2);
        }
    }

    /**
     * @param {string} key 
     * @return {OK|FAILED} - unreg status
     */
    async unreg(key: string){
        const state = await this.redisDel(key);
        if(state == 'OK')return 'OK';
            else return 'FAILED';
    }
};

export {
    USER_STAT,
    Heartbeat, 
}