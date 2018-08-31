export default interface ITodos {
  addTodo(todo: string): Promise<string[]>;
  getTodos(): Promise<string[]>;
}
