/* to do with file */
import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as path from 'path';
import * as moment from 'moment'; 
import ctxBody from '../utils/ctxBody';
import getJson from '../utils/getjson';

import {upl_stat} from '../interfaces';
//import fdb from '../models/files.model';                 // DB which store informations of files
import {FILE_STAT, Cache} from '../service/UploadCache'; // file-stat cache
import {FileService} from '../service/FileService';      // file-store service

const config:any = getJson(path.resolve(__dirname, '..', '..' + '/configs/storage.config'));
const filesConfig:any = getJson(path.resolve(__dirname, '..', '..' + '/configs/files.config'));
const cacheConf:any = config.redis['1'];
const fileConfig = filesConfig.fileService;

const fileS = new FileService();
const cacheS = new Cache(cacheConf, fileConfig.expire);

const uploadFile: Koa.Middleware = async(ctx, next)=> {
    const file = ctx.request.files.file;
    const name = file.name;
    const fileStat = await cacheS.checkExpire(name);
    switch(fileStat.code){
        case 0: {
            const fsStat = await fileS.StoreFile(file.path, name);
            if(fsStat == true){
                const fileInfo = await cacheS.getValue(name);
                const cacheStat = await cacheS.update(name, );
                if(fileInfo != false && cacheStat.code != 3){
                    if(cacheStat != )
                    const res: upl_stat = {
                        code: 0,
                        state: 'OK',
                        time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                    }
                    ctxBody(ctx, res, 200);
                }
                else{
                    throw {errcode: 101, err: fsStat};
                }
            }else{
                throw {errcode: 101, err: fsStat};
            }
            break;
        }// file status normal
        case 1: {
            const fileInfo = await cacheS.getValue(file.name);
            if(fileInfo != false){
                cacheS.update(file.name, 'REFRESH');
                const res: upl_stat = {
                    code: 1,
                    state: 'EXPIRED',
                    time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                    payload: {
                        count: fileInfo.count,
                    }
                }
                ctxBody(ctx, res, 200);
            }else{
                throw {errcode: 101};
            }
            break;
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
    /*
    const dbStat = await fdb.create({
        title: file_info.title,
        time: file_info.time,
        description: file_info.description,
        url: '/file',
        size: 100,
        hash: 'ssss',
        author: usr
    });
    */
    const redisStat= await cacheS.reg(file_info.title, {size: file_info.size, recieved: 0});
}

export {uploadFile, regFile};