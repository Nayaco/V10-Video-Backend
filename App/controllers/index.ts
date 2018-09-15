import * as Koa from 'koa';
import * as Router from 'koa-router';
import {upload, reg, del, cancel, stop, verify} from './upload';
const _router = new Router();

export const router = ():Koa.Middleware=> {
    _router.post('/media',upload);
    _router.post('/regmedia', reg);
    return _router.routes();
}