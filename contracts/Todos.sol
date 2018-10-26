pragma solidity ^0.4.2;

contract Todos {
    address private contractOwner = msg.sender;

    struct Todo {
        bool complete;
        bytes32 text;
        bool deleted;
        address owner;
    }

    Todo[] public todos;
    event AfterAddTodo(bytes32 todo);

    function getTodoIds()
        public
        view
        returns (uint256[] ids)
    {
        uint256 numNotDeleted = 0;
        for (uint256 i = 0; i < todos.length; i++) {
            if (todos[i].deleted == false) {
                numNotDeleted++;
            }
        }

        uint256[] memory idList = new uint256[](numNotDeleted);
        uint256 idListIndex = 0;
        for (uint256 j = 0; j < todos.length; j++) {
            if (todos[j].deleted == false) {
                idList[idListIndex] = j;
                idListIndex++;
            }
        }
        return idList;
    }

    function deleteTodo(uint256 index)
        public
        indexInBounds(index)
        onlyBy(todos[index].owner)
        returns (bool success)
    {
        todos[index].deleted = true;
        return true;
    }

    function addTodo(bytes32 todoText)
        public
        payable
        costs(1 ether)
    {
        Todo memory newTodo = Todo({
            complete: false,
            deleted: false,
            text: todoText,
            owner: msg.sender
        });
        todos.push(newTodo);
    }

    function toggleTodoAtIndex(uint256 index)
        public
        indexInBounds(index)
        onlyBy(todos[index].owner)
        returns (bool)
    {
        bool complete = todos[index].complete;
        todos[index].complete = !complete;
        return true;
    }

    function getTodo(uint256 index)
        constant
        public
        indexInBounds(index)
        returns (bytes32 text, bool complete, bool deleted, address owner)
    {
        return (todos[index].text, todos[index].complete, todos[index].deleted, todos[index].owner);
    }

    modifier onlyBy(address _account)
    {
        require(
            msg.sender == _account
        );
        _;
    }

    modifier costs(uint _amount) {
        require(
            msg.value >= _amount
        );
        _;
        if (msg.value > _amount)
            msg.sender.transfer(msg.value - _amount);

        contractOwner.transfer(_amount);
    }

    modifier indexInBounds(uint256 index) {
        require(
            index < todos.length
        );
        _;
    }

}
