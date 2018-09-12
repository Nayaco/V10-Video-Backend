import {Cache} from '../App/service/UploadCache'; 

const ca = new Cache({
    name: 'test',
    host: 'localhost',
    port: 6379
}, 500);

ca.exist('mikuchan.jpg').then((res)=>{
    console.log(res);
    process.exit();
})