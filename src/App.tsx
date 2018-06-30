import * as React from "react";
import { EthRpc, JsonRpc, HttpTransport } from 'emerald-js';
import { BigNumber } from 'bignumber.js';
var contractJson = require("../build/contracts/MetaCoin.json");
import * as Contract from "truffle-contract";
import EmeraldWeb3Provider from "../emerald-web3-provider";
import IMetaCoin from "./contract-interfaces/IMetaCoin";

interface IAppState {
  emerald: EthRpc;
  netVersion: string;
  balance: BigNumber;
  truffleContract: IMetaCoin;
}

const endpoint = "http://localhost:8545";
const emeraldJsonRpc = new JsonRpc(new HttpTransport(endpoint));
const emerald = new EthRpc(emeraldJsonRpc);

const MetaCoinContract: Contract = Contract(contractJson);
MetaCoinContract.setProvider(new EmeraldWeb3Provider(emeraldJsonRpc));

class App extends React.Component<{}, IAppState> {
  public state: IAppState;

  constructor(props) {
    super(props);
    this.state = {
      emerald,
      netVersion: null,
      balance: null,
      truffleContract: null,
    };
    this.getInfo = this.getInfo.bind(this);
  }

  public async componentWillMount() {
    const metaCoinContractInstance: IMetaCoin = await MetaCoinContract.deployed();
    this.setState({
      truffleContract: metaCoinContractInstance,
    });
  }

  public async getInfo() {
    this.setState({
      netVersion: await emerald.net.version(),
      balance: await this.state.truffleContract.getBalance("0x85AB05DcD17399fAadb93a362E69EbB27CeF0C2c"),
    });
  }

  public render() {
    return (
      <div>
        <button onClick={this.getInfo}>Get Info</button>
        {this.state.netVersion}
        {this.state.balance && this.state.balance.toString()}
      </div>
    );
  }
}

export default App;
