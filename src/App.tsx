import Input from "emerald-js-ui/lib/components/Input";
import Page from "emerald-js-ui/lib/components/Page";
import * as React from "react";
import * as Contract from "truffle-contract";
import * as Web3 from "web3";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { TransactionButton } from 'emerald-js-ui';

import Paper from "@material-ui/core/Paper";
import { Contract as SmartContract, EmeraldProvider, AppBar, EtcBalance, NetworkSelector, AccountSelector, CurrentBlockNumber } from 'emerald-js-ui';

import getWeb3 from "./util/getWeb3";

let contractJson = require("../build/contracts/Todos.json");

interface IAppState {
  todos: string[];
  textarea: string;
  truffleContract: any;
  web3: Web3;
  transaction: any;
  accounts: any;
  account: string;
  changeAccount: (string) => any;
}

const TodosContract: Contract = Contract(contractJson);

class App extends React.Component<{}, IAppState> {
  public state: IAppState;
  public input: React.Component;

  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      web3: null,
      textarea: null,
      truffleContract: {},
      transaction: {},
      accounts: [],
      account: null,
      changeAccount: account => {
        this.setState({
          ...this.state,
          account,
          transaction: {
            ...this.state.transaction,
            from: account,
          }
        });
      }
    };
  }

  public async componentWillMount() {
    const web3 = await getWeb3();
    TodosContract.setProvider(web3.currentProvider);
    const truffleContract = await TodosContract.deployed();
    this.setState({
      ...this.state,
      truffleContract, 
      web3,
      transaction: {
        gas: 420000,
        from: this.state.account,
        to: truffleContract.address,
      }
    });
  }

  public renderTodos(todos) {
    return (
      <List component="nav">
        {todos.map((todo, i) => {
          return (
            <Paper>
              <ListItem key={i}>
                <ListItemText primary={new Buffer(todo, 'hex').toString()} />
              </ListItem>
            </Paper>
          );
        })}
      </List>
    );
  }

  public handleTextAreaChange(event) {
    this.setState({
      textarea: event.target.value,
      transaction: {
        ...this.state.transaction,
        mode: "contract_function",
        functionSignature: contractJson.abi.find((item) => item.name === 'addTodo'),
        argsDefaults: [
          {
            name: "todo",
            value: event.target.value
          },
        ]
      }
    });
  }

  public render() {
    return (
      <EmeraldProvider ethUrl="http://localhost:8545">
        <AppBar title="Emerald" subtitle="Starter Kit">
          <NetworkSelector />
          <CurrentBlockNumber />
          <AccountSelector account={this.state.account} onChange={this.state.changeAccount}/>
          <EtcBalance account={this.state.account}/>
        </AppBar>
        <br />
        <Page title="Emerald Starter Kit">
          <div>
            <Input multiline={true} id="textarea" value={this.state.textarea} onChange={this.handleTextAreaChange.bind(this)} inputRef={(input) => this.input = input}/>
            <TransactionButton onClick={() => {this.setState({textarea: ''})}} transaction={this.state.transaction} />
          </div>
          <SmartContract address={this.state.truffleContract.address} abi={contractJson.abi} method="getTodos" refresh={3000}>
            {(results) => {
               // get first param results value
               return this.renderTodos(results[0].value)
            }}
          </SmartContract>
        </Page>
      </EmeraldProvider>
    );
  }
}

export default App;
