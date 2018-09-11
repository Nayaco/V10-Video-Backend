export interface upl_stat {
    code: 0|1|2|3|4,
    state: 'OK'|'EXPIRED'|'OFFLINE'|'SUCCESS'|'FAILED',
    time: string,
    payload?: object,
}; 