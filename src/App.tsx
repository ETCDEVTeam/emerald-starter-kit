import * as React from "react";
var contractJson = require("../build/contracts/Todos.json");
import * as Web3 from "web3";
import * as Contract from "truffle-contract";
import ITodos from "./contract-interfaces/ITodos";
import Page from "emerald-js-ui/lib/components/Page";
import getWeb3 from "./util/getWeb3";

interface IAppState {
  netVersion: string;
  todos: string[];
  textarea: string;
  truffleContract: ITodos;
  web3: Web3;
}

const TodosContract: Contract = Contract(contractJson);

class App extends React.Component<{}, IAppState> {
  public state: IAppState;

  constructor(props) {
    super(props);
    this.state = {
      netVersion: null,
      todos: null,
      web3: null,
      textarea: null,
      truffleContract: null,
    }
    this.refreshTodos = this.refreshTodos.bind(this);
    this.addTodo = this.addTodo.bind(this);
  }

  public async componentWillMount() {
    const web3 = await getWeb3();
    TodosContract.setProvider(web3.currentProvider);
    this.setState({
      truffleContract: await TodosContract.deployed(),
      web3
    });
    this.refreshTodos();
  }

  async refreshTodos() {
    const todos = await this.state.truffleContract.getTodos();
    this.setState({
      todos: todos.map((todo) => this.state.web3.toAscii(todo))
    });
  }

  renderTodos(todos) {
    return todos.map((todo, i) => {
      return (
          <li key={i}>{todo}</li>
      );
    })
  }

  addTodo() {
    return this.state.web3.eth.getAccounts((err, accounts) => {
      return this.state.truffleContract.addTodo(this.state.web3.fromAscii(this.state.textarea), {
        from: accounts[0]
      }).then(this.refreshTodos);
    });
  }

  handleTextAreaChange(event) {
    this.setState({
      textarea: event.target.value
    });
  }

  public render() {
    return (
      <Page title="Emerald Starter Kit">
        <br />
        {this.state.todos && this.renderTodos(this.state.todos)}
        <br />
        <textarea id="textarea" value={this.state.textarea} onChange={this.handleTextAreaChange.bind(this)} />
        <button onClick={this.addTodo.bind(this)}>Add Todo</button>

      </Page>
    );
  }
}

export default App;
