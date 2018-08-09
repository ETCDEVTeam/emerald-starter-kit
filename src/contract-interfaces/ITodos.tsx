export default interface ITodos {
  addTodo(todo: string, params: any): Promise<string[]>;
  getTodos(): Promise<string[]>;
}
