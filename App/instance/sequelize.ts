import * as Sequelize from 'sequelize'

const createsequelize = (db:string, username:string, password:string)=> {
    const sql = new Sequelize(db, username, password, {
        dialect: "mysql",
        port: 3306,
    });
    return sql
}

export default createsequelize;
