const Todos = artifacts.require("./Todos.sol");

contract('Todo', accounts => {
  it("should get the todos", () => {
    return Todos.deployed()
      .then(todos => {
        return todos.getTodos().then(todos => {
          assert.equal(todos.length, 0, "todos length is not 0");
        });
      });
  });
});
