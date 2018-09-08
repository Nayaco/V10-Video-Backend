import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import {EXPIRE_INFO, makeExpireInfo, Heartbeat} from '../service/Heartbeat';
import {FileService} from '../service/FileService';
import getJson from '../utils/getjson';
import * as path from 'path';

const config:any = getJson(path.resolve(__dirname, '..', '..' + '/configs/storage.config'));
const fileS = new FileService();
const hbS = new Heartbeat({
    name: config.name,
    host: config.host,
    port: config.port,
}, 30);

const uploadFile: Koa.Middleware = async(ctx, next)=> {
    const file = ctx.request.files.file;
    fileS.StoreFile(file.path, file.name);
    await next();
}

const regFile: Koa.Middleware = async(ctx, next)=> {

}

export {uploadFile, regFile};