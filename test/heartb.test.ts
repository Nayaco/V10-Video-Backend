import * as moment from 'moment';
import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { redis_interface, hb_interface } from '../App/interfaces';
bluebird.promisifyAll(redis);

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
    }

    async reg(usr: string, file: string){
        const now = (new Date()).getTime() / 1000;
        const status = {
            usr: usr,
            time: now,
            count: 0,
            status: 'ONLINE',
        }
        const state = await this.redisHmset(file, status);
        console.log(typeof(state));
        return state;
    }

    async getStatus(file: string){
        const status:any = await this.redisHgetall(file);
        const ans = {
            usr: status.usr,
            file: status.file,
            time: status.time,
            status: status.status,
        } 
        return status;
    }

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
        
    }
}

const main = async() =>{
    const hb = new HeartbeatService({
        name: 'redis1',
        host: '127.0.0.1',
        port: 6379
    }, 4000);
    const status = await hb.reg('testadmin', 'testfile1');
    console.log(status);
    const ans = await hb.getStatus('testfile1');
    console.log(ans);
}

main().then(()=>{
    console.log('Ok');
    process.exit();
})