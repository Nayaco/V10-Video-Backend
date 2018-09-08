import {Heartbeat} from '../../App/service/Heartbeat';

const HB = new Heartbeat({
    host: '127.0.0.1',
    name: 'redistest',
    port: 6379
}, 20);

const main = async() => {
    //const state = await HB.reg('tester0', {id: 'aliyun'}); 
    const status = await HB.checkExpire('tester0');
    console.log(status);
}

main().then(()=>{
    process.exit();
})