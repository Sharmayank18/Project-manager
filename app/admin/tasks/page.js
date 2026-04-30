'use client';
import { useState, useEffect } from 'react';

export default function AdminTaskAssignment() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      // Fetch projects
      const projectsRes = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch tasks
      const tasksRes = await fetch('/api/admin/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskForm)
      });
      
      if (res.ok) {
        setTaskForm({
          title: '',
          description: '',
          project: '',
          assignedTo: '',
          priority: 'Medium',
          dueDate: ''
        });
        setShowTaskForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTaskAssignment = async (taskId, newAssignedTo) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assignedTo: newAssignedTo })
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update task assignment:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Task Assignment</h1>
          <p className="text-gray-600 mt-1">Assign tasks to team members by name</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Assign New Task
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Task</th>
                  <th className="px-4 py-2 text-left">Project</th>
                  <th className="px-4 py-2 text-left">Assigned To</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Priority</th>
                  <th className="px-4 py-2 text-left">Due Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id} className="border-t">
                    <td className="px-4 py-2">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2">{task.project?.name}</td>
                    <td className="px-4 py-2">
                      <select
                        value={task.assignedTo?._id || ''}
                        onChange={(e) => updateTaskAssignment(task._id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-full"
                      >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'Todo' ? 'bg-gray-200' :
                        task.status === 'In Progress' ? 'bg-yellow-200' :
                        'bg-green-200'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.priority === 'High' ? 'bg-red-200' :
                        task.priority === 'Medium' ? 'bg-yellow-200' :
                        'bg-green-200'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {task.dueDate ? (
                        <span className={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-600' : ''}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-sm text-gray-600">
                        Created by: {task.createdBy?.name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Task Assignment Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Assign New Task</h3>
            <form onSubmit={createTask}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task Title"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                />
                
                <textarea
                  placeholder="Task Description"
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                />
                
                <select
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={taskForm.project}
                  onChange={(e) => setTaskForm({...taskForm, project: e.target.value})}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                >
                  <option value="">Assign to Member</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
                
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}