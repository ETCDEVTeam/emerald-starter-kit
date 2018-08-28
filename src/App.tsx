import Input from "emerald-js-ui/lib/components/Input";
import Page from "emerald-js-ui/lib/components/Page";
import * as React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { TransactionButton } from 'emerald-js-ui';

import Paper from "@material-ui/core/Paper";
import { Contract, EmeraldProvider, AppBar, EtcBalance, NetworkSelector, AccountSelector, CurrentBlockNumber } from 'emerald-js-ui';

const contractJson = require("../build/contracts/Todos.json");

interface IAppState {
  todos: string[];
  textarea: string;
  contractAddress: string;
  contractAbi: any[];
  transaction: any;
  account: string;
  changeAccount: (string) => any;
}

class App extends React.Component<{}, IAppState> {
  public state: IAppState;

  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      textarea: null,
      transaction: {},
      account: null,
      contractAddress: contractJson.networks[61].address,
      contractAbi: contractJson.abi,
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
        to: this.state.contractAddress,
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
        functionSignature: this.state.contractAbi.find((item) => item.name === 'addTodo'),
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
            <Input multiline={true} id="textarea" value={this.state.textarea} onChange={this.handleTextAreaChange.bind(this)}/>
            <TransactionButton transaction={this.state.transaction} />
          </div>
          <Contract address={this.state.contractAddress} abi={this.state.contractAbi} method="getTodos" refresh={3000}>
            {(results) => this.renderTodos(results[0].value)}
          </Contract>
        </Page>
      </EmeraldProvider>
    );
  }
}

export default App;
