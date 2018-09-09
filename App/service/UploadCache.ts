/* file */
import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { redis_interface } from '../interfaces';

type FILE_INFO = {code: 0, info: 'ONLINE'}|{code: 1, info: 'EXPIRED'}|{code: 2, info: 'OFFLINE'}|null;

/**
 * @param {number}code
 * @return {FILE_INFO} - loooook above
 */
function makeFileinfo(code: number): FILE_INFO{
    switch(code){
        case 0: return {code: 0, info: 'ONLINE'};
        case 1: return {code: 1, info: 'EXPIRED'};
        case 2: return {code: 2, info: 'OFFLINE'};
        default: return null;
    }
}

class Cache{
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
        const value = {...payload, time: now, state: 'ONLINE', count: 0};
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
    * @return {FILE_INFO} -expire status 
    */
    async checkExpire(key: string, now: number = (new Date()).getTime() / 1000){
        const value = await this.redisHgetall(key);
        const lastChange = value.time;
        if(now - lastChange >= this.expire && value.state == 'ONLINE'){
            return makeFileinfo(1);
        }else if(value.state == 'OFFLINE'){
            return makeFileinfo(2);
        }else{
            return makeFileinfo(0);
        }
    }

    /** 
    * @param {string} key 
    * @param {UPDATE|HANGUP|REFRESH} command
    * @param {object} payload
    * @return {ONLINE|EXPIRED|OFFLINE} - update status
    */
    async update(key: string, command: string = 'UPDATE', payload:object = {}){
        if(command != 'UPDATE' && command != 'HANGUP' && command != 'REFRESH')return 'Syntax Error';
        const now = (new Date()).getTime() / 1000;
        const expireStatus = await this.checkExpire(key, now);
        let rawValue = await this.getValue(key);
        rawValue = {...rawValue, ...payload};
        if(command == 'REFRESH'  && rawValue.state != 'OFFLINE')return 'ONLINE';
        if(expireStatus.code == 0){
            let newValue:any;
            if(command == 'UPDATE'){
                newValue = {...rawValue, time: now};
                const state = await this.redisHmset(key, newValue);
                if(state == 'OK')return makeFileinfo(0);
                    else throw {errcode: 1, err: 'REDIS FAILED'};
            }else if(command == 'HANGUP'){
                newValue = {...rawValue, time: now, state: 'OFFLINE'};
                const state = await this.redisHmset(key, newValue);
                if(state == 'OK')return makeFileinfo(2);
                    else throw {errcode: 1, err: 'REDIS FAILED'};
            }
        }else if(expireStatus.code == 1 && rawValue.state != 'OFFLINE'){
            const newValue = {...rawValue, state: 'OFFLINE'};
            const state = await this.redisHmset(key, newValue);
            if(state == 'OK')return makeFileinfo(1);
                else throw {errcode: 1, err: 'REDIS FAILED'};
        }else{
            if(command == 'REFRESH'){
                const newValue = {...rawValue, state: 'OFFLINE'};
                const state = await this.redisHmset(key, newValue);
                if(state == 'OK')return makeFileinfo(1);
                    else throw {errcode: 1, err: 'REDIS FAILED'};
            }else{
                return makeFileinfo(2);
            }
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
    FILE_INFO,
    makeFileinfo,
    Cache, 
}