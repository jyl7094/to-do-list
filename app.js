const express = require("express");
const app = express();
const port = process.env.PORT;
const date = require(__dirname + "/date.js");

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const tasks = [];
const workTasks = [];

app.get("/", (req, res) => {
    res.render("list", {title: date.getDate(), tasks: tasks});
});

app.get("/work", (req, res) => {
    res.render("list", {title: "Work List", tasks: workTasks});
});

app.get("/about", (req, res) => {
    res.render("about");
}); 

app.post("/", (req, res) => {
    console.log(req.body);
    if (req.body.list === "Work List") {
        workTasks.push(req.body.task);
        res.redirect("/work");
    } else {
        tasks.push(req.body.task);
        res.redirect("/");
    }
});

app.listen(port || 3000, () => {
    console.log(`Server started on port: ${port || 3000}`);
});
