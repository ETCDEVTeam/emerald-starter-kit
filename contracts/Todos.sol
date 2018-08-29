pragma solidity ^0.4.2;

contract Todos {
    struct Todo {
        bool complete;
        bytes32 text;
        bool deleted;
    }

    Todo[] public todos;
    event AfterAddTodo(bytes32 todo);

    function getTodoIds()
        public
        view
        returns (uint256[] ids)
    {
        uint256[] memory idList = new uint256[](todos.length);

        for (uint256 i = 0; i < todos.length; i++) {
            if (!todos[i].deleted) {
                idList[i] = i;
            }
        }
        return idList;
    }

    function deleteTodo(uint256 index)
        public
        indexInBounds(index)
        returns (bool success)
    {
        todos[index].deleted = true;
        return true;
    }

    function addTodo(bytes32 todoText) public {
        Todo memory newTodo = Todo({
            complete: false,
            deleted: false,
            text: todoText
        });
        todos.push(newTodo);

        emit AfterAddTodo(newTodo.text);
    }

    function toggleTodoAtIndex(uint256 index)
        public
        indexInBounds(index)
        returns (bool)
    {
        bool complete = todos[index].complete;
        todos[index].complete = !complete;
        return true;
    }

    modifier indexInBounds(uint256 index) {
        require(
            index < todos.length
        );
        _;
    }

    function getTodo(uint256 index)
        constant
        public
        indexInBounds(index)
        returns (bytes32 text, bool complete, bool deleted)
    {
        return (todos[index].text, todos[index].complete, todos[index].deleted);
    }
}