const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// app.use(express.json());
app.use(cors());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    // Verify if exists User
    const user = users.find(user =>
        user.username === username);
    if (!user) return response.status(404)
        .json({ error: "User not found" });

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExists = users.some(user =>
        user.username === username);
    if (userAlreadyExists) return response.status(400)
        .json({ error: "User already exists" });

    const user = {
        id: uuidv4(),
        name,
        username,
        todos: []
    }

    users.push(user);
    return response.status(201)
        .json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.status(200)
        .json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body

    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }
    user.todos.push(todo)

    return response.status(201)
        .json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const todos = request.user.todos;
    const { id } = request.params;
    const { title, deadline } = request.body;

    const todo = todos.find(todo => todo.id === id);
    if (!todo) return response.status(404)
        .json({ error: "Todo not found" });

    todo.title = title;
    todo.deadline = deadline;

    return response.status(200)
        .json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const todos = request.user.todos;
    const { id } = request.params;

    const todo = todos.find(todo => todo.id === id);
    if (!todo) return response.status(404)
        .json({ error: "Todo not found" });

    todo.done = true;

    return response.status(200)
        .json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const todos = request.user.todos;
    const { id } = request.params;

    const todo = todos.find(todo => todo.id === id);
    if (!todo) return response.status(404)
        .json({ error: "Todo not found" });

    todos.splice(todo, 1);

    return response.status(204).send();
});

module.exports = app;