export interface sql_interface {
    host: string, 
    username: string,
    passwd: string,
    dialect?: string,
    port?: number,
    poolopt?:{
        max: number,
        min: number,
    }
};