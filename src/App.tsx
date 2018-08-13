import { MuiThemeProvider } from "@material-ui/core/styles";
import {TransactionButton} from "emerald-js-ui";
import Input from "emerald-js-ui/lib/components/Input";
import Page from "emerald-js-ui/lib/components/Page";
import theme from "emerald-js-ui/src/theme";
import * as React from "react";
import * as Contract from "truffle-contract";
import * as Web3 from "web3";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import Paper from "@material-ui/core/Paper";

import ITodos from "./contract-interfaces/ITodos";
import getWeb3 from "./util/getWeb3";

let contractJson = require("../build/contracts/Todos.json");

interface IAppState {
  todos: string[];
  textarea: string;
  truffleContract: ITodos;
  web3: Web3;
  transaction: any;
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
      truffleContract: null,
      transaction: null,
    };
    this.refreshTodos = this.refreshTodos.bind(this);
    this.getTodoFromEventLog = this.getTodoFromEventLog.bind(this);
    this.addTodo = this.addTodo.bind(this);
  }

  public async componentWillMount() {
    const web3 = await getWeb3();
    debugger;
    TodosContract.setProvider(web3.currentProvider);
    this.setState({
      truffleContract: await TodosContract.deployed(),
      web3,
    });
    this.refreshTodos();
  }

  public async refreshTodos() {
    const todos = await this.state.truffleContract.getTodos();
    this.setState({
      todos: todos.reverse().map((todo) => this.state.web3.toAscii(todo)),
    });
  }

  public getTodoFromEventLog(transactionResult) {
    const newTodos = [];
    transactionResult.logs.forEach((log) => {
      if (log.event === "AfterAddTodo") {
        newTodos.push(this.state.web3.toAscii(log.args.todo.valueOf()));
      }
    });
    this.setState({
      todos: [...newTodos, ...this.state.todos],
    });
  }

  public renderTodos(todos) {
    return (
      <List component="nav">
        {this.state.todos.map((todo, i) => {
          return (
            <Paper>
              <ListItem key={i}>
                <ListItemText primary={todo} />
              </ListItem>
            </Paper>
          );
        })}
      </List>
    );
  }

  public addTodo() {
    return this.state.web3.eth.getAccounts((err, accounts) => {
      debugger;
      return this.state.truffleContract.addTodo(this.state.web3.fromAscii(this.state.textarea), {
        from: accounts[0],
      }).then(this.getTodoFromEventLog)
        .then(() => {
          this.setState({
            textarea: "",
          });
        });
    });
  }

  public handleTextAreaChange(event) {
    this.setState({
      textarea: event.target.value,
    });
  }

  public render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Page title="Emerald Starter Kit">
          <div>
            <Input multiline={true} id="textarea" value={this.state.textarea} onChange={this.handleTextAreaChange.bind(this)} inputRef={(input) => this.input = input}/>
            <TransactionButton transaction={this.state.transaction} />
          </div>
          {this.state.todos && this.renderTodos(this.state.todos)}
        </Page>
      </MuiThemeProvider>
    );
  }
}

export default App;
