import * as Koa from 'koa';
import * as Router from 'koa-router';
import {upload, reg, del, cancel, stop, verify} from './upload';
const _router = new Router();

/// main entry of this koa-application
/// added following controlllers
/// 1. media upload router
/// 2. media regester
/// 3. media delete
/// 
export const router = ():Koa.Middleware=> {
    _router.post('/media',upload);
    _router.post('/regmedia', reg);
    _router
    return _router.routes();
}