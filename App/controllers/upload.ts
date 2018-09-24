/* to do with file */
import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as path from 'path';
import * as moment from 'moment'; 
import ctxBody from '../utils/ctxBody';
import getJson from '../utils/getjson';

import {upl_stat} from '../interfaces';
import fdb from '../models/files.model';                 // DB which store informations of files
import {FILE_STAT, Cache} from '../service/UploadCache'; // file-stat cache
import {FileService} from '../service/FileService';      // file-store service

const config:any = getJson(path.resolve(__dirname, '..', '..' + '/configs/storage.config'));
const filesConfig:any = getJson(path.resolve(__dirname, '..', '..' + '/configs/files.config'));
const cacheConf:any = config.redis['1'];
const fileConfig = filesConfig.fileService;

const fileS = new FileService();
const cacheS = new Cache(cacheConf, fileConfig.expire);

/**
 * upload a blob
 * @param ctx 
 * @param next 
 */
const upload: Koa.Middleware = async(ctx, next)=> {
    const file = ctx.request.files.file;
    const info = ctx.request.body;
    const name = file.name;
    /*if(file.hash != info.hash){
        await cacheS.update(name, 'HANGUP');
        throw {errcode: 201, err: 'Trans Failed'};
    }*/
    const fileStat = await cacheS.checkExpire(name);
    switch(fileStat.code){
        case 0: {
            const fsStat = await fileS.StoreFile(file.path, name);
            const fileInfo = await cacheS.getValue(name);
            const cacheStat = await cacheS.update(name, 'UPDATE',{
                recieved: file.size + fileInfo.recieved,
            });
            if(fileInfo != false && cacheStat.code != 4){
                if(fileInfo.size > file.size + fileInfo.recieved){
                    const res: upl_stat = {
                        code: 0,
                        state: 'OK',
                        time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                        payload: {
                            finish: false,
                        }
                    };
                    ctxBody(ctx, res, 200);
                }else{
                    const unregStat = await cacheS.unreg(name);
                    if(unregStat == 'FAILED')throw {errcode: 101, err: 'Redis Failed'};
                    const res: upl_stat = {
                        code: 0,
                        state: 'OK',
                        time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                        payload: {
                            finish: true,
                        }
                    };
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
            if(fileInfo != false && cacheStat.code != 4){
                const res: upl_stat = {
                    code: 1,
                    state: 'EXPIRED',
                    time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                    payload: {
                        info: 'REFRESHED',
                        count: fileInfo.count,
                    }
                };
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
            if(fileInfo != false && cacheStat.code != 4){
                const res: upl_stat = {
                    code: 2,
                    state: 'OFFLINE',
                    time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                    payload: {
                        info: 'REFRESHED',
                        count: fileInfo.count,
                    }
                };
                ctxBody(ctx, res, 200);
            }else{
                throw {errcode: 101, err: 'Redis Failed'};
            }
            break;
        }
        case 3: {
            const res: upl_stat = {
                code: 4,
                state: 'FAILED',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                payload: {
                    info: 'NOT EXIST'
                }
            };
            ctxBody(ctx, res, 200);
            break;
        }
        default: {
            throw {errcode: 101, err: 'Redis Failed'};
        }
    }
    await next();
}

/**
 * hangup the mission
 * @param ctx 
 * @param next 
 */
const stop: Koa.Middleware = async(ctx, next)=> {
    const info = ctx.request.body;
    const redisStat =  await cacheS.update(info.name, 'HANGUP');
    if(redisStat.code == 2){
        const res: upl_stat = {
            code: 2,
            state: 'OFFLINE',
            time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
        };
        ctxBody(ctx, res, 200);
    }else if(redisStat.code == 3){
        const res: upl_stat = {
            code: 4,
            state: 'FAILED',
            time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
            payload: {
                info: 'NOT EXIST'
            }
        };
        ctxBody(ctx, res, 200);
    }else{
        throw {errcode: 101, err: 'Redis Failed'};
    }
    await next();
}

/**
 * verify when finish
 * @param ctx 
 * @param next 
 */
const verify: Koa.Middleware = async(ctx, next)=> {
    const info = ctx.request.body;
    const name = info.name;
    const hash =  await fileS.GetHash(name);
    if(info.hash == hash){
        const dbStat = await fdb.update({
            hash: hash,
        }, {
            where: {
                url: `/${name}`,
            }
        });
        const redisStat = await cacheS.unreg(info.name);
        if(redisStat == 'OK'){
            const res: upl_stat = {
                code: 3,
                state: 'SUCCESS',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
            };
            ctxBody(ctx, res, 200);
        }else{
            throw {errcode: 101, err: 'Redis Failed'};
        }
    }else{
        const redisStat = await cacheS.unreg(info.name);
        if(redisStat == 'OK'){
            await fileS.Del(info.name);
            const res: upl_stat = {
                code: 4,
                state: 'FAILED',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
            }
            ctxBody(ctx, res, 200);
        }else{
            throw {errcode: 101, err: 'Redis Failed'};
        }
    }
    await next();
}

/**
 * @param ctx 
 * @param next 
 */
const reg: Koa.Middleware = async(ctx, next)=> {
    const info:any = ctx.request.body;
    const usr = info.usr;
    const dbStat = await fdb.create({
        title: info.title,
        time: info.time,
        description: info.description,
        url: `/${info.name}`,
        size: info.size,
        hash: 'N/A',
        author: usr
    });
    
    const redisStat = await cacheS.reg(info.name, {size: info.size, recieved: 0});
    switch(redisStat){
        case 'OK': {
        const res: upl_stat = {
            code: 3,
                state: 'SUCCESS',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
            };
            ctxBody(ctx, res, 200);
            break;
        }
        case 'EXIST': {
            const res: upl_stat = {
                code: 4,
                state: 'FAILED',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                payload: {
                    regerr: 'EXIST'
                }
            };
            ctxBody(ctx, res, 200);
            break
        }
        case 'FAILED': {
            throw {errcode: 101, err: 'Redis Failed'};
        }
    }
}

const cancel: Koa.Middleware = async(ctx, next)=> {
    const info:any = ctx.request.body;
    const usr = info.usr;
    
    const dbStat = await fdb.destroy({
        where: {
            url: `/${name}`,
        }
    });
    
    const redisStat = await cacheS.unreg(info.name);
    switch(redisStat){
        case 'OK': {
            const res: upl_stat = {
                code: 3,
                state: 'SUCCESS',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
            };
            await fileS.Del(info.name);
            ctxBody(ctx, res, 200);
            break;
        }
        case 'NOT EXIST': {
            const res: upl_stat = {
                code: 4,
                state: 'FAILED',
                time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
                payload: {
                    regerr: 'NOT EXIST'
                }
            };
            ctxBody(ctx, res, 200);
            break;
        }
        case 'FAILED': {
            throw {errcode: 101, err: 'Redis Failed'};
        }
    }
}

export {upload, reg, stop, cancel, verify};