const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect(process.env.URL);

const port = process.env.PORT || 3000;

const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    }
});

const Task = mongoose.model('Task', taskSchema);

let task1 = new Task({
    task: 'Welcome to your to-do list!'
});

let task2 = new Task({
    task: 'Hit the + button to add a new task.'
});

let task3 = new Task({
    task: '⬅️ Hit this to delete a task.'
});

let defaultTasks = [task1, task2, task3];

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tasks: [taskSchema]
});

const List = mongoose.model('List', listSchema);


app.get('/', (req, res) => {
    Task.find({}, (err, tasks) => {
        if (tasks.length === 0) {
            Task.insertMany(defaultTasks, (err) => {
                (err) ? console.log(err): console.log('Successfully added!');
            });
            res.redirect('/');
        } else {
            res.render('list', {
                title: 'Today',
                tasks: tasks
            });
        }
    });
});

app.get('/:route', (req, res) => {
    const route = req.params.route.toLowerCase().replace(/\s/g , "-");
    const list = new List({
        name: route,
        tasks: defaultTasks
    });

    List.findOne({name: route}, (err, results) => {
        if (!err) {
            if (route === 'about') {
                res.render('about');
            } else if (!results) {
                const list = new List({
                    name: route,
                    tasks: defaultTasks
                });
                list.save();
                res.redirect(`/${route}`);
            } else {
                res.render('list', {
                    title: results.name.slice(0, 1).toUpperCase() + results.name.slice(1),
                    tasks: results.tasks
                });
            }
        } else {
            console.log(err);
        }
    });
});

app.post('/', (req, res) => {
    const listName = req.body.list.toLowerCase().replace(/\s/g , "-");
    const task = req.body.task;
    const newTask = new Task({
        task: task
    });

    if (listName === 'today') {
        newTask.save();
        res.redirect('/');
    } else {
        List.findOne({name: listName}, (err, results) => {
            results.tasks.push(newTask);
            results.save();
            res.redirect(`/${listName}`);
        });
    }
});

app.post('/delete', (req, res) => {
    const listName = req.body.listName.toLowerCase().replace(/\s/g , "-");
    const taskId = req.body.check;

    if (listName === 'today') {
        Task.findByIdAndRemove({_id: taskId}, (err) => {
            (err) ? console.log(err): console.log('Successfully deleted!');
        });
        res.redirect('/');
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {tasks: {_id: taskId}}}, (err, results) => {
            if (!err) {
                res.redirect(`/${listName}`);
            } else {
                console.log(err);
            }
        });
    }
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});
