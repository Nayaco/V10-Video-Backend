import * as Koa from 'koa';
import * as Router from 'koa-router';

const _router = new Router();
export const router = ():Koa.Middleware=> {
    return _router.routes();
}