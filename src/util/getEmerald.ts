import { EthRpc, JsonRpc, HttpTransport } from 'emerald-js';

let p: EthRpc;

const endpoint = "https://web3.gastracker.io";

const getEmerald = (): EthRpc => {
  if (!p) {
    p = new EthRpc(new JsonRpc(new HttpTransport(endpoint)));
  }

  return p
};

export default getEmerald;
