export interface upl_stat {
    code: 0|1|2|3|4,
    state: 'OK'|'EXPIRED'|'OFFLINE'|'SUCCESS'|'FAILED',
    time: string,
    payload?: object,
}; 

/**
 * 0: OK
 * 1: EXPIRED
 * 2: OFFLINE 
 * 3: SUCCESS
 * 4: FAILED (payload info will show the err
 */
