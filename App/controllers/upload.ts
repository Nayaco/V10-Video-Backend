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
    const info = ctx.request.body;
    const name = file.name;

    if(file.hash != info.hash){
        await cacheS.update(name, 'HANGUP');
        throw {errcode: 201, err: 'Trans Failed'};
    }
    const fileStat = await cacheS.checkExpire(name);
    switch(fileStat.code){
        case 0: {
            const fsStat = await fileS.StoreFile(file.path, name);
            const fileInfo = await cacheS.getValue(name);
            const cacheStat = await cacheS.update(name);
            if(fileInfo != false && cacheStat.code != 3){
                if(fileInfo.size > file.size + fileInfo.recieved){
                    const res: upl_stat = {
                        code: 0,
                        state: 'OK',
                        time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                        payload: {
                            finish: false,
                        }
                    }
                    ctxBody(ctx, res, 200);
                }else{
                    const res: upl_stat = {
                        code: 0,
                        state: 'OK',
                        time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                        payload: {
                            finish: true,
                            hash: fileS.GetHash(name),
                        }
                    }
                    ctxBody(ctx, res, 200);
                }
            }else{
                await cacheS.update(name, 'HANGUP');
                throw {errcode: 101, err: 'Redis Failed'};
            }
            break;
        }// file status normal
        case 1: {
            const fileInfo = await cacheS.getValue(file.name);
            const cacheStat = await cacheS.update(file.name, 'REFRESH');
            if(fileInfo != false && cacheStat.code != 3){
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
                await cacheS.update(name, 'HANGUP');
                throw {errcode: 101, err: 'Redis Failed'};
            }
            break;
        }
        case 2: {
            const fileInfo = await cacheS.getValue(file.name);
            const cacheStat = await cacheS.update(file.name, 'REFRESH');
            if(fileInfo != false && cacheStat.code != 3){
                const res: upl_stat = {
                    code: 2,
                    state: 'OFFLINE',
                    time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                    payload: {
                        count: fileInfo.count,
                    }
                }
                ctxBody(ctx, res, 200);
            }else{
                throw {errcode: 101, err: 'Redis Failed'};
            }
            break;
        }
        default: {
            throw {errcode: 101, err: 'Redis Failed'};
        }
    }
    await next();
}

const stopFile: Koa.Middleware = async(ctx, next)=> {
    
    await next();
}
const verify: Koa.Middleware = async(ctx, next)=> {
    const info = ctx.request.body;
    if(info.verify == true){
        const redisStat = await cacheS.unreg(info.name);
        if(redisStat == 'OK'){
            const res: upl_stat = {
                code: 3,
                state: 'SUCCESS',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
            }
            ctxBody(ctx, res, 200);
        }else{
            const res: upl_stat = {
                code: 3,
                state: 'FAILED',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
            }
            ctxBody(ctx, res, 200);
        }
    }else{

    }
    await next();
}

const regFile: Koa.Middleware = async(ctx, next)=> {
    const info:any = ctx.request.body;
    const usr = info.usr;
    /*
    const dbStat = await fdb.create({
        title: file_info.name,
        time: file_info.time,
        description: file_info.description,
        url: '/file',
        size: 100,
        hash: 'ssss',
        author: usr
    });
    */
    const redisStat= await cacheS.reg(info.name, {size: info.size, recieved: 0});
}


export {uploadFile, regFile};