'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch projects with tasks
      const projectsResponse = await fetch('/api/admin/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch all tasks
      const tasksResponse = await fetch('/api/admin/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch all users
      const usersResponse = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setAllTasks(tasksData);
      }
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) return <div className="p-6">Loading...</div>;

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  
  const totalTasks = allTasks.length;
  const todoTasks = allTasks.filter(t => t.status === 'Todo').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;
  const doneTasks = allTasks.filter(t => t.status === 'Done').length;
  const overdueTasks = allTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
  ).length;
  
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'Admin').length;
  const memberUsers = users.filter(u => u.role === 'Member').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/tasks')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Manage Tasks
              </button>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
              <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
              <div className="mt-2 text-sm">
                <span className="text-green-600">{activeProjects} Active</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-blue-600">{completedProjects} Completed</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
              <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
              <div className="mt-2 text-sm">
                <span className="text-yellow-600">{inProgressTasks} In Progress</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-green-600">{doneTasks} Done</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Overdue Tasks</h3>
              <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
              <div className="mt-2 text-sm text-gray-600">
                {overdueTasks > 0 ? 'Needs attention' : 'All on track'}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
              <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              <div className="mt-2 text-sm">
                <span className="text-purple-600">{adminUsers} Admins</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-blue-600">{memberUsers} Members</span>
              </div>
            </div>
          </div>

          {/* Task Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Todo</span>
                  <span className="font-semibold">{todoTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">In Progress</span>
                  <span className="font-semibold">{inProgressTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Done</span>
                  <span className="font-semibold">{doneTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Overdue</span>
                  <span className="font-semibold">{overdueTasks}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-600">Active</span>
                  <span className="font-semibold">{activeProjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Completed</span>
                  <span className="font-semibold">{completedProjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">On Hold</span>
                  <span className="font-semibold">{projects.filter(p => p.status === 'On Hold').length}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-600">Admins</span>
                  <span className="font-semibold">{adminUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Members</span>
                  <span className="font-semibold">{memberUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-semibold">{totalUsers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Task</th>
                      <th className="px-4 py-2 text-left">Project</th>
                      <th className="px-4 py-2 text-left">Assigned To</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTasks.slice(0, 10).map(task => (
                      <tr key={task._id} className="border-t">
                        <td className="px-4 py-2">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2">{task.project?.name}</td>
                        <td className="px-4 py-2">{task.assignedTo?.name || 'Unassigned'}</td>
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
                          {task.dueDate ? (
                            <span className={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-600' : ''}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Projects Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div key={project._id} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{project.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'Active' ? 'bg-green-100 text-green-800' :
                        project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {project.taskStats?.total || 0} tasks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}