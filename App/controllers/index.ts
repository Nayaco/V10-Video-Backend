import * as Koa from 'koa';
import * as Router from 'koa-router';
import {uploadFile} from './upload';
const _router = new Router();

export const router = ():Koa.Middleware=> {
    _router.post('/media',uploadFile);
    return _router.routes();
}