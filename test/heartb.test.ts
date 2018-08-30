import * as moment from 'moment';
import * as redis from 'redis';
import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { redis_interface, hb_interface } from '../App/interfaces';
bluebird.promisifyAll(redis);

class HeartbeatService{
    client: RedisClient;
    _redisconfig: redis_interface;
    
    constructor(redis_conf: redis_interface){
        this._redisconfig = redis_conf;
        if(redis_conf.passwd == undefined || redis_conf.passwd == null){
            this.client = redis.createClient({
                host: this._redisconfig.host,
                port: this._redisconfig.port,
            });
        }else{
            this.client = redis.createClient({
                host: this._redisconfig.host,
                port: this._redisconfig.port,
                password : this._redisconfig.passwd,
            });
        }
    }

    async reg(usr: string, file: string){
        const now = moment().format('x')
        //console.log(this.client.)
        const store_status = await this.client.hmset(file, {
            usr: usr,
            time: now,
            count: 0,
            status: 'N',
        });
        
        return store_status;
    }

    async status(file: string){
        const status:any = await this.client.hgetall(file);
        const ans = {
            usr: status.usr,
            file: status.file,
            time: status.time,
            status: status.status,
        } 
        return ans;
    }

    async unreg(){
        
    }
}

const main = async() =>{
    /*const hb = new HeartbeatService({
        name: 'redis1',
        host: '127.0.0.1',
        port: 6379
    });
    const status = await hb.reg('testadmin', 'testfile1');
    console.log(status);
    const ans = await hb.status('testfile1');
    console.log(ans);*/
    const client = await redis.createClient({
        host: '127.0.0.1',
        port: 6379
    });
    console.log(client);
    client.on('error', (err)=>{console.log(err)})
    const store_status = await client.set('testadmin', 'test');
    console.log(store_status);
    client.quit();
}

main().then(()=>{
    console.log('Ok');
    process.exit();
})