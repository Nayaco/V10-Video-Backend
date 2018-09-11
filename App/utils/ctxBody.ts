import * as Koa from 'koa';

const ctxBody = (ctx: Koa.Context, payload: object, state: number = 200)=> {
    ctx.body = payload;
    ctx.status = state;
}

export default ctxBody;