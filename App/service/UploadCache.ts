/* file */
import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { redis_interface } from '../interfaces';

type FILE_STAT = {code: 0, info: 'ONLINE'}|{code: 1, info: 'EXPIRED'}|{code: 2, info: 'OFFLINE'}|{code: 3, info: 'NOT EXIST'}|{code: 4, info: 'REDIS FAILED'};

/**
 * @param {number}code
 * @return {FILE_STAT} - loooook above
 */
function makeFileStat(code: number): FILE_STAT{
    switch(code){
        case 0: return {code: 0, info: 'ONLINE'};
        case 1: return {code: 1, info: 'EXPIRED'};
        case 2: return {code: 2, info: 'OFFLINE'};
        case 3: return {code: 3, info: 'NOT EXIST'};        
        case 4: return {code: 4, info: 'REDIS FAILED'};
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
    redisKeys: any;
    keyList: Array<string>;
    count: number = 0;

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
        this.redisKeys = bluebird.promisify(this.client.keys).bind(this.client);
        this.keyList = [];
    };

    /** 
    * @param {string} key
    * @param {object} payload
    * @return {OK|FAILD|EXIST} - state 
    */
    async reg(key: string, payload: object){
        const now = (new Date()).getTime() / 1000;
        const findKey = await this.exist(key);
        if(findKey == false){ 
            const value = {...payload, time: now, state: 'ONLINE', count: 0};
            const state = await this.redisHmset(key, value);
            if(state == 'OK'){
                this.keyList.push(key);
                return 'OK';
            }else return 'FAILED';
        }else{
            return 'EXIST';
        }
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
    * @return {FILE_STAT} -expire status 
    */
    async checkExpire(key: string, now: number = (new Date()).getTime() / 1000){
        const findKey = await this.exist(key);
        if(findKey == false)return makeFileStat(3);
        const value = await this.getValue(key);
        const lastChange = value.time;
        if(now - lastChange >= this.expire && value.state == 'ONLINE'){
            return makeFileStat(1);
        }else if(value.state == 'OFFLINE'){
            return makeFileStat(2);
        }else{
            return makeFileStat(0);
        }
    }

    /** 
    * @param {string} key 
    * @param {UPDATE|HANGUP|REFRESH} command
    * @param {object} payload
    * @return {FILE_STAT} - update status
    */
    async update(key: string, command: 'UPDATE'|'HANGUP'|'REFRESH' = 'UPDATE', payload:object = {}){
        const now = (new Date()).getTime() / 1000;
        const expireStatus = await this.checkExpire(key, now);
        let rawValue = await this.getValue(key);
        rawValue = {...rawValue, ...payload};
        let newValue = {};

        if(expireStatus.code == 0){
            if(command == 'UPDATE'){// online
                newValue = {...rawValue, time: now, count: rawValue.count + 1};
                const state = await this.redisHmset(key, newValue);
                if(state == 'OK')return makeFileStat(0);
                    else return makeFileStat(4);
            }else if(command == 'HANGUP'){
                newValue = {...rawValue, time: now, state: 'OFFLINE'};
                const state = await this.redisHmset(key, newValue);
                if(state == 'OK')return makeFileStat(2);
                    else return makeFileStat(4);
            }else{
                return makeFileStat(0);               
            }
        }else if(expireStatus.code == 1){// expired
            if(command == 'UPDATE'){
                return makeFileStat(1);
            }else if(command == 'HANGUP'){
                newValue = {...rawValue, time: now, state: 'OFFLINE'};
                const state = await this.redisHmset(key, newValue);
                if(state == 'OK')return makeFileStat(2);
                    else return makeFileStat(4);
            }else{
                newValue = {...rawValue, time: now, state: 'ONLINE'};
                const state = await this.redisHmset(key, newValue);
                if(state == 'OK')return makeFileStat(0);
                    else return makeFileStat(4);               
            }
            
        }else if(expireStatus.code == 2){ // offline
            if(command == 'UPDATE'){
                return makeFileStat(2);
            }else if(command == 'HANGUP'){
                return makeFileStat(2);
            }else{
                newValue = {...rawValue, time: now, state: 'ONLINE'};
                const state = await this.redisHmset(key, newValue);
                if(state == 'OK')return makeFileStat(0);
                    else return makeFileStat(4);               
            }
        }else{
            return expireStatus;
        }
    }

    /**
     * @param {string} key 
     * @return {OK|FAILED|NOT EXIST} - unreg status
     */
    async unreg(key: string){
        const findKey = await this.exist(key);
        if(findKey == false)return 'NOT EXIST';
        const state = await this.redisDel(key);
        this.keyList.splice(this.keyList.indexOf(key), 1);
        if(state == true)return 'OK';
            else return 'FAILED';
    }

    /**
     * @param {string} key 
     * @return {TRUE|FALSE|FAILED} - unreg status
     */
    async exist(key: string){
        if(this.count == 0){
            this.count = (this.count + 1) % 50;
            this.keyList = await this.redisKeys('*');
        }
        return this.keyList.includes(key);
    }
};

export {
    FILE_STAT,
    Cache, 
}