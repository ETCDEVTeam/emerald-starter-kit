import * as React from "react";

import { Typography, Grid, IconButton, Button, Paper, Checkbox, List, ListItem, ListItemText, ListItemIcon } from "@material-ui/core";
import { TransactionUri, Page, Input, Contract, EmeraldProvider, AppBar, EtcBalance, NetworkSelector, AccountSelector, CurrentBlockNumber } from 'emerald-js-ui';
import { Close } from 'emerald-js-ui/lib/icons3';

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

  private renderToggleCheckbox(abi, { to, from, gas }, todoId, complete, color) {
    return (
      <TransactionUri
        abi={abi}
        to={to}
        from={from}
        gas={gas}
        method="toggleTodoAtIndex"
        params={[{name: 'index', value: todoId.toNumber()}]}
      >
        {transactionUri =>
          <Checkbox checked={complete.value} onClick={() => window.location.href = transactionUri} color={color} />
        }
      </TransactionUri>
    );
  }

  private renderDeleteButton(abi, { to, from, gas }, todoId) {
    return (
      <TransactionUri
        abi={abi}
        to={to}
        from={from}
        gas={gas}
        method="deleteTodo"
        params={[{name: 'index', value: todoId.toNumber()}]}
      >
        {transactionUri =>
          <IconButton onClick={() => window.location.href = transactionUri}>
            <Close />
          </IconButton>
        }
      </TransactionUri>
    );
  }

  public renderTodos(todoIds) {
    return (
      <React.Fragment>
        <Typography variant="title" color="inherit">{todoIds.length} Tasks found on chain</Typography>
        <br />
        <br />
        <List component="nav">
          {todoIds.map((todoId) => {
             return (
               <Contract address={this.state.contractAddress} abi={this.state.contractAbi} method="getTodo" params={{index: todoId.toNumber()}}>
                 {([text, complete, deleted]) => {
                    const color = complete.value ? "primary" : "textSecondary";
                    return (
                      <Paper>
                        <ListItem key={todoId.toNumber()}>
                          <ListItemIcon>
                            {this.renderToggleCheckbox(this.state.contractAbi, this.state.transaction, todoId, complete, color)}
                          </ListItemIcon>
                          <ListItemText primary={new Buffer(text.value, 'hex').toString()} primaryTypographyProps={{color}}/>
                          <ListItemIcon>
                            {this.renderDeleteButton(this.state.contractAbi, this.state.transaction, todoId)}
                          </ListItemIcon>
                        </ListItem>
                      </Paper>
                    )
                 }}
               </Contract>
             );
          })}
        </List>
      </React.Fragment>
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
          <EtcBalance account={this.state.account}/>
          <AccountSelector account={this.state.account} onChange={this.state.changeAccount}/>
        </AppBar>
        <br />
        <div style={{maxWidth: '1100px', margin: '0 auto'}}>
          <Page title="Todo List">
            <Typography variant="title" color="inherit">Add a new Task</Typography>
            <br />
            <br />
            <Grid container spacing={24} justify="center" direction="row" alignItems="center">
              <Grid item xs>
                <div style={{marginTop: '20px'}} />
                <Input id="textarea" placeholder="Buy Milk" value={this.state.textarea} onChange={this.handleTextAreaChange.bind(this)}/>
              </Grid>
              <Grid item xs>
                <TransactionUri abi={this.state.contractAbi} {...this.state.transaction} value={'1000000000000000000'}>
                  {(transactionUri) => (<Button variant="contained" href={transactionUri}>Send Transaction</Button>)}
                </TransactionUri>
              </Grid>
            </Grid>
            <br />
            <br />
            <Contract address={this.state.contractAddress} abi={this.state.contractAbi} method="getTodoIds" refresh={3000}>
              {([{value}]) => this.renderTodos(value)}
            </Contract>
          </Page>
        </div>
      </EmeraldProvider>
    );
  }
}


export default App;
