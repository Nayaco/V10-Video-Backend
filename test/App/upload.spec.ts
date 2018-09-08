import {Heartbeat} from '../../App/service/Heartbeat';

const HB = new Heartbeat({
    host: 'localhost',
    name: 'redistest',
    port: 6379
}, 20);
describe("HB", () => {
    describe("test hb", () => {
        it("test", async() => {
           //const state = await HB.reg('tester0', {id: 'ali'}); 
           const status = await HB.checkExpire('tester0');
           console.log(status);
        });
    })
});