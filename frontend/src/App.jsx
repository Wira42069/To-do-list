import './App.css'
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  Button,
  Icon
} from '@mui/material';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  

  const fetchTask = async (e) => {
    try{
      fetch('http://127.0.0.1:5000/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(error => console.error("Error fetchin tasks:", error));
    }
    catch{
      console.error("Couldn't load tasks: ", e);
    }
  }

  const addTask = async (e) => {
    e.preventDefault(); // Prevents the browser from doing a full page reload

    if (!newTaskTitle.trim()) return; // Don't submit empty tasks

    try {
      const response = await fetch('http://127.0.0.1:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle }) // send data as JSON
      });

      if (response.ok){
        // 1. clear the input field
        setNewTaskTitle('');

        // 2. Re-fetch entire list to update the UI
        fetchTask();
      } else{
        console.error("Failed to add task on server.");
      }
    } catch (error){
      console.error("Network error adding task:", error);
    }
  };

  const deleteTask = async(taskId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok){
        fetchTask();
      } else {
        console.error("Failed to delete task on server.");
      }
    } catch (error){
      console.error("Network error deleting task", error);
    }
  };


  useEffect(() => {
    // fetch data from running flask API endpoint
    fetchTask();
  }, [])

  return (
    <Container>
      {/*Displays list*/}
      <Typography variant="h4" component="h1">My Pretty To-Do List</Typography>
      <List>
        {tasks.map(task => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}> 
            <IconButton
              aria-label='delete'
              size="small"
              onClick={() => deleteTask(task.id)}
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          
            <div style={{ flexGrow:1, paddingLeft: '10px' }}>
              <ListItem key={task.id} style={{ opacity: task.is_complete ? 0.5 : 1}}>
                {task.title}
              </ListItem>
            </div>
          </div>
        ))}
      </List>


      {/*Add task*/}
      <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {/* MUI TextField (prettier input) */}
        {/* The value and onChange are crucial for connecting the input to React state */}
        <input 
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New Task..."
          style={{ flexGrow: 1, padding: '10px', fontSize: '16px' }}
        />
        <button 
          type="submit"
          variant="contained"
          color="primary"  
        >
          Add Task
        </button>
      </form>
    </Container>
  );
}

export default App
