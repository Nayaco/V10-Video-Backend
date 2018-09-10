export interface upl_stat {
    code: 0|1|2,
    state: 'OK'|'EXPIRED'|'OFFLINE',
    time: string,
    payload?: object,
}; 