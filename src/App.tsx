import * as React from "react";

import { Button, Paper, Checkbox, List, ListItem, ListItemText, ListItemIcon} from "@material-ui/core";
import { TransactionUri, Page, Input, Contract, EmeraldProvider, AppBar, EtcBalance, NetworkSelector, AccountSelector, CurrentBlockNumber } from 'emerald-js-ui';

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
      contractAddress: contractJson.networks[1].address,
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

  public renderTodos(todoIds) {
    return (
      <List component="nav">
        {todoIds.map((todoId) => {
           return (
             <Contract address={this.state.contractAddress} abi={this.state.contractAbi} method="getTodo" params={{index: todoId.toNumber()}}>
               {([text, complete, deleted]) => (
                 <Paper>
                   <ListItem key={todoId.toNumber()}>
                     <ListItemIcon>
                       <TransactionUri abi={this.state.contractAbi} to={this.state.transaction.to} from={this.state.transaction.from} gas={this.state.transaction.gas} method="toggleTodoAtIndex" params={[{name: 'index', value: todoId.toNumber()}]}>
                         {transactionUri => <Checkbox checked={complete.value} onClick={() => window.location.href = transactionUri}/>}
                       </TransactionUri>
                     </ListItemIcon>
                     <ListItemText primary={new Buffer(text.value, 'hex').toString()} />
                   </ListItem>
                 </Paper>
               )}
             </Contract>
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
        method: 'addTodo',
        params: [
          {
            name: 'todoText',
            value: event.target.value
          }
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
            <TransactionUri abi={this.state.contractAbi} {...this.state.transaction}>
              {(transactionUri) => <Button variant="contained" href={transactionUri}>Send Transaction</Button>}
            </TransactionUri>
          </div>
          <Contract address={this.state.contractAddress} abi={this.state.contractAbi} method="getTodoIds" refresh={3000}>
            {([{value}]) => this.renderTodos(value)}
          </Contract>
        </Page>
      </EmeraldProvider>
    );
  }
}


export default App;
