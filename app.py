import sqlite3
from flask import Flask, request, redirect, url_for, jsonify
from flask_cors import CORS

# initialize flask app
app = Flask(__name__)
CORS(app)
DATABASE = 'todo.db'

# -------DB setup functions---------------

# function to connect to db
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row #allows to access column by name 
    return conn

#function to create tasks table
def init_db():
    with app.app_context(): #context is needed to run operations before app starts
        db = get_db()
        # SQL command to create the task table
        db.execute(""" 
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                is_complete INTEGER DEFAULT 0
            );
        """)
        db.commit()

# --- call the setup function when app runs ---
# this ensures the db and table exist when you start server
init_db()


# --- Main Route (to display the to do list) ---

# Route for fetching all tasks (GET)
@app.route('/api/tasks')
def get_tasks():
    db = get_db()
    # SQL to get all tasks, ordered by ID
    tasks = db.execute('SELECT * FROM tasks ORDER BY id DESC').fetchall()
    db.close()
    
    tasks_list = [dict(task) for task in tasks]
    
    return jsonify(tasks_list)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    # Flask's request.json automatically parses the JSON data sent from React
    data = request.json
    
    # Get title from JSON payload (React sends {'title': 'New Task'})
    task_title = data.get('title')
    
    # If task is empty, return error
    if not task_title:
        return jsonify({"error": "Task title is required"}), 400
    try:
        db = get_db()
        #SQL command to insert new task
        db.execute('INSERT INTO tasks (title) VALUES (?)', (task_title,))
        db.commit()
        db.close()
        return jsonify({"message": "Task created succesfully"}), 201
    
    except Exception as e:
        # Basic error handling
        print(f"Database error: {e}")
        return jsonify({"error": "Could not add task"}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        db = get_db()
        cursor = db.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        db.commit()
        db.close()
        
        # Check if anything was actually deleted
        if cursor.rowcount == 0:
            return jsonify({"error": "Task not found"}), 404
        
        # otherwise return a 200 OK status
        return jsonify({"message": f"Task {task_id} deleted"}), 200
    except Exception as e:
        print(f"Database error deleting task: {e}")
        return jsonify({"error":"Internal server error"}), 500

# --- run app ---
if __name__ == '__main__':
    app.run(debug=True)