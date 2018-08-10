import * as RpcEngine from "json-rpc-engine";
import * as asMiddleware from "json-rpc-engine/src/asMiddleware";
import * as createAsyncMiddleware from "json-rpc-engine/src/createAsyncMiddleware";
import * as createScaffoldMiddleware from "json-rpc-engine/src/createScaffoldMiddleware";
import * as Web3 from "web3";

interface P extends Web3.Provider {
  rpcEngine?: object;
}

let p: Promise<Web3>;

const getWeb3 = (): Promise<Web3> => {
  if (!p) {
    p = new Promise<Web3>((resolve, reject) => {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      window.addEventListener("load", () => {
        let web3: Web3 = (window as any).web3 as Web3;
        const engine = new RpcEngine();
        engine.push(createScaffoldMiddleware({
          eth_accounts: createAsyncMiddleware((req, res, next, end) => {
            alert("eth_accounts");
          }),
          eth_sign: createAsyncMiddleware((req, res, next, end) => {
            alert("eth_accounts");
          }),
          personal_sign: createAsyncMiddleware((req, res, next, end) => {
            alert("eth_accounts");
          }),
        }));

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== "undefined") {
          console.log("Using injected web3 provider");
          const newProvider: P = web3.currentProvider;
          engine.push(asMiddleware(newProvider.rpcEngine));
          web3 = new Web3({
            sendAsync: (request, cb) => {
              debugger;
              engine.handle(request, cb);
            },
          });
        } else {
          // Fallback to localhost if no web3 injection.
          console.log("No web3 instance injected, using Local web3.");
          const provider = new Web3.providers.HttpProvider("http://localhost:8545");
          web3 = new Web3(provider);
        }
        (window as any).web3 = web3;
        resolve(web3);
      });
    });
  }
  return p;
};

export default getWeb3;
