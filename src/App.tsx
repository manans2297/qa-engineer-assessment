import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import styled from "@emotion/styled";
import { AddInput } from "./components/AddInput";
import { TodoItem } from "./components/TodoItem";
import { TodoList } from "./components/TodoList";
import { Header } from "./components/Header";
import { Todo } from "./interface";

const Wrapper = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: 300,
});

/**
* This is the initial todo state.
* Instead of loading this data on every reload,
* we should save the todo state to local storage,
* and restore on page load. This will give us
* persistent storage.
*/

const initialData: Todo[] = [
  {
    id: uuid(),
    label: "Buy groceries",
    checked: false,
  },
  {
    id: uuid(),
    label: "Reboot computer",
    checked: false,
  },
  {
    id: uuid(),
    label: "Ace CoderPad interview",
    checked: true,
  },
];

function App() {
  const [todos, setTodos] = useState<Todo[]>(()=>{
    const savedTodos = window.localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : initialData;
  });

  // Save todos to localStorage whenever they change
  useEffect(() => {
    window.localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback((label: string) => {
    setTodos((prev) => [
      {
        id: uuid(),
        label,
        checked: false,
      },
      ...prev,
    ]);
  }, []);

  const handleChange = (id: string, checked: boolean) => {
    setTodos((prevTodos) => {
      // Update the checked state of the todo
      const updatedTodos = prevTodos.map((todo) =>
        todo.id === id ? { ...todo, checked } : todo
      );
      // Sort the todos: unchecked items first, checked items last
      const sortedTodos = updatedTodos.sort((a, b) => Number(a.checked) - Number(b.checked));
      return sortedTodos;
    });
  };

  return (
    <Wrapper>
      <Header>Todo List</Header>
      <AddInput onAdd={addTodo} />
      <TodoList>
        {todos.map((todo) => (
          <li>
            <TodoItem key={todo.id} {...todo} onChange={(checked) => handleChange(todo.id, checked)} />
          </li>
        ))}
      </TodoList>
    </Wrapper>
  );
}

export default App;