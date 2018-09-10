/* to do with file */
import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as path from 'path';
import * as moment from 'moment'; 
import getJson from '../utils/getjson';

import fdb from '../models/files.model';                 // DB which store informations of files
import {FILE_STAT, Cache} from '../service/UploadCache'; // file-stat cache 
import {FileService} from '../service/FileService';      // file-store service

const config:any = getJson(path.resolve(__dirname, '..', '..' + '/configs/storage.config'));
const cacheConf:any = config.redis['1'];

const fileS = new FileService();
const cacheS = new Cache(cacheConf, 300);

const uploadFile: Koa.Middleware = async(ctx, next)=> {
    const file = ctx.request.files.file;
    const fileStat = await cacheS.checkExpire(file.name);
    switch(fileStat.code){
        case 0: {
            const fsStat = await fileS.StoreFile(file.path, file.name);
            if(fsStat == true){
                cacheS.update(file.name);
            }
            break;
        }
        case 1: {
            ctx.body = {

            }
            break;
        }
        case 2: {
            break;
        }
        default: {

        }
    }
    await next();
}

const regFile: Koa.Middleware = async(ctx, next)=> {
    const file_info:any = ctx.request.body;
    const usr = file_info.usr;
    const dbStat = await fdb.create({
        title: file_info.title,
        time: file_info.time,
        description: file_info.description,
        url: '/file',
        size: 100,
        hash: 'ssss',
        author: usr
    });
    const redisSta= await cacheS.reg(file_info.title, {usr: usr});
}

export {uploadFile, regFile};