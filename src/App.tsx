import Input from "emerald-js-ui/lib/components/Input";
import Page from "emerald-js-ui/lib/components/Page";
import * as React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { TransactionButton } from 'emerald-js-ui';

import Paper from "@material-ui/core/Paper";
import { Contract as SmartContract, EmeraldProvider, AppBar, EtcBalance, NetworkSelector, AccountSelector, CurrentBlockNumber } from 'emerald-js-ui';


let contractJson = require("../build/contracts/Todos.json");

interface IAppState {
  todos: string[];
  textarea: string;
  transaction: any;
  accounts: any;
  contractAddress: string;
  account: string;
  changeAccount: (string) => any;
}

class App extends React.Component<{}, IAppState> {
  public state: IAppState;
  public input: React.Component;

  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      textarea: null,
      contractAddress: contractJson.networks['61'].address,
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
    this.setState({
      ...this.state,
      transaction: {
        gas: 420000,
        from: this.state.account,
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
        to: this.state.contractAddress,
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
            <TransactionButton transaction={this.state.transaction} />
          </div>
          <SmartContract address={this.state.contractAddress} abi={contractJson.abi} method="getTodos">
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
