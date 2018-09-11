import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import {router} from './controllers';
const app = new Koa();

app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 10*1024*1024,
        hash: 'md5',
    },
}));

app.use(router());

app.listen(8080);