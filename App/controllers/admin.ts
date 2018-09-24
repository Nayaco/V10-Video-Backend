import * as Koa from 'koa';


const del: Koa.Middleware = async(ctx, next)=> {
    const info = ctx.request.body;
    
    const dbStat = await fdb.destroy({
        where: {
            url: `/${name}`,
        }
    });
    
    const fileInfo = await cacheS.exist(info.name);
    if(fileInfo == true){
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
            case 'FAILED': {
                throw {errcode: 101, err: 'Redis Failed'};
            }
        }
    }else{
        const res: upl_stat = {
            code: 3,
            state: 'SUCCESS',
            time: moment().format('YYYY-MM-DD HH:mm:ss.sssZ'),
        };
        await fileS.Del(info.name);
        ctxBody(ctx, res, 200);
    }
}