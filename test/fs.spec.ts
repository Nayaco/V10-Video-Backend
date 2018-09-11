import {FileService} from '../App/service/FileService';      // file-store service

const fs = new FileService();

fs.GetHash('mikuchan.jpg').then((res)=>{
    console.log(res, 'ggg');
});

