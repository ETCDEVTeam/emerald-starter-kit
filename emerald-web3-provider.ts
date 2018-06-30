import { JsonRpc } from 'emerald-js';

class EmeraldWeb3Provider {
    private emeraldJsonRpc: JsonRpc;

    constructor(emeraldJsonRpc: JsonRpc) {
        this.emeraldJsonRpc = emeraldJsonRpc;
    }

    public async sendAsync({ method, params }, cb) {
        try {
            const result = await this.emeraldJsonRpc.call(method, params)
            cb(null, { jsonrpc: "2.0", id: 123, result });
        } catch (e) {
            cb(e);
        }
    }
}

export default EmeraldWeb3Provider;
