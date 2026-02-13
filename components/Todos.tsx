import React, { createContext, useContext, useEffect, useState } from "react";



// THIS IS FOR TESTING ONLY
interface Todo {
  id: string;
  item: string;
}

const TodosContext = createContext({
  todos: [], fetchTodos: () => {}
})

const Bulletpoints = () => {

	const { todos } = useContext(TodosContext);

	return (
		<ul>
		{todos.map((todo: Todo) => (
			<li key={todo.id}>{todo.item}</li>
		))}
		</ul>
	)
};


export default function Todos() {
  const [todos, setTodos] = useState([])
  const fetchTodos = async () => {
    const response = await fetch("http://localhost:8000/todo")
    const todos = await response.json()
    setTodos(todos.data)
  }

  useEffect(() => {
  	fetchTodos()
	}, [])

	return (
	<TodosContext.Provider value={{todos, fetchTodos}}>
		<Bulletpoints />
	</TodosContext.Provider>
	)
}