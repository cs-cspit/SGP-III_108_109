const express = require("express")
const users = require("./MOCK_DATA.json")
const app = express();
const port = 3000;
//Routes

app.get('/api/users',(req,res) => {
    const html = `
    <ul>
        ${users.map((user) => `<li>${user.name}`)}
    </ul>`;
    res.send(html)
})

app.get('/users',(req,res) => {
    return res.json(users)
})

app.get('/users/:id',(req,res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id)
    return res.json(user)
})
app.listen(port, () => console.log(`server started at PORT ${port}`))

console.log("http://localhost:3000/")