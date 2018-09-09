import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import {USER_STAT, Heartbeat} from '../service/Heartbeat';
import {FILE_STAT, Cache} from '../service/UploadCache';
import {FileService} from '../service/FileService';
import getJson from '../utils/getjson';
import * as path from 'path';

const config:any = getJson(path.resolve(__dirname, '..', '..' + '/configs/storage.config'));
const hbsConf:any = config.redis['0'];
const cacheConf:any = config.redis['1'];

const fileS = new FileService();
const hbS = new Heartbeat(hbsConf, 600);
const cacheS = new Cache(cacheConf, 300);


const uploadFile: Koa.Middleware = async(ctx, next)=> {
    const file = ctx.request.files.file;
    fileS.StoreFile(file.path, file.name);
    await next();
}

const regFile: Koa.Middleware = async(ctx, next)=> {
    const file_info:any = ctx.request.body;
    const usr = file_info.usr;
    
}

const regUsr: Koa.Middleware = async(ctx, next)=> {
    
}

export {uploadFile, regFile, regUsr};

