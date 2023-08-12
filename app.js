const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const uri = "mongodb+srv://moayyadalazzam:GVtPjkX8hHChmG7j@cluster0.348ct3z.mongodb.net/todoListDB?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: Boolean,
  time: String,
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false }, // New 'deleted' field
});

const Task = mongoose.model('Task', taskSchema);

app.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ deleted: false }); // Fetch tasks that are not deleted

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString(undefined, options);

    res.render('index', { tasks, formattedDate }); // Pass the formattedDate variable
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add-task', async (req, res) => {
  const taskText = req.body.taskInput;
  if (taskText) {
    const newTask = new Task({
      title: taskText,
      completed: false,
      time: new Date().toLocaleTimeString(), // Set the time field to the current time
    });
    try {
      await newTask.save();
      console.log('Task saved:', newTask);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }
  res.redirect('/');
});

app.post('/update-task', async (req, res) => {
  const taskId = req.body.taskId;
  try {
    const task = await Task.findById(taskId);
    if (task) {
      task.completed = !task.completed;
      task.time = new Date().toLocaleTimeString(); // Update the time field
      await task.save();
      console.log('Task updated:', task);
    }
  } catch (error) {
    console.error('Error updating task:', error);
  }
  res.redirect('/');
});

app.post('/delete-task', async (req, res) => {
  const taskId = req.body.taskId;
  try {
    const task = await Task.findById(taskId);
    if (task) {
      task.deleted = true; // Mark the task as deleted
      await task.save();
      console.log('Task deleted:', task);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
  res.redirect('/');
});


app.listen(process.env.PORT ||port, () => {
    console.log(`App listening on port ${port}`);
    console.log(`App listening on port ${process.env.PORT}`);
  });
