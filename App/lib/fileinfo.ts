import * as Sequelize from 'sequelize';
import getJSON from '../utils/getjson';
import * as path from 'path';

const storageConfig:any = getJSON(path.resolve(__dirname, '..', '..') + '/configs/storage.config');
const mysqlConfig = storageConfig.mysql["0"];

const createsequelize = (db:string, username:string, password:string)=> {
    const sql = new Sequelize(db, username, password, {
        dialect: "mysql",
        port: 3306,
    });
    return sql
}

const instance = createsequelize(mysqlConfig.db, mysqlConfig.usr, mysqlConfig.passwd);
export default instance;
