import * as Koa from 'koa';
import * as Router from 'koa-router';
import {uploadFile, regFile} from './upload';
const _router = new Router();

export const router = ():Koa.Middleware=> {
    _router.post('/media',uploadFile);
    _router.post('/regmedia', regFile);
    return _router.routes();
}