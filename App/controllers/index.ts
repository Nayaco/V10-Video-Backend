import * as Koa from 'koa';
import * as Router from 'koa-router';
import {upload, reg, cancel, stop, verify} from './upload';
const _router = new Router();

/// main entry of this koa-application
/// added following controlllers
/// 1. media upload router
/// 2. media regester
/// 3. media delete
/// 
export const router = ():Koa.Middleware=> {
    _router.post('/media/blob', upload);
    _router.post('/media/reg', reg);
    _router.post('/media/cancel', cancel);
    return _router.routes();
}