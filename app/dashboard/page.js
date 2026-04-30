'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, Users, FolderOpen, Target } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    setUser(user);
    
    if (user.role === 'Admin') {
      router.push('/admin');
      return;
    }
    
    fetchProjects(token);
    fetchTasks(token);
  }, [router]);

  const fetchProjects = async (token) => {
    try {
      const res = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchTasks = async (token) => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: taskId, status })
      });
      if (res.ok) {
        fetchTasks(token);
      }
    } catch (error) {
      console.error('Failed to update task');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  // Data processing for charts
  const taskStatusData = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'Todo').length, color: '#ef4444' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#f59e0b' },
    { name: 'Done', value: tasks.filter(t => t.status === 'Done').length, color: '#10b981' }
  ];

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'High').length, color: '#dc2626' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, color: '#d97706' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length, color: '#059669' }
  ];

  const projectStatusData = [
    { name: 'Active', value: projects.filter(p => p.status === 'Active').length, color: '#3b82f6' },
    { name: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: '#10b981' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'On Hold').length, color: '#6b7280' }
  ];

  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'
  );

  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Project Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {user.name} ({user.role})
                </span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-500 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}! 👋</h2>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Projects</h3>
                <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Tasks</h3>
                <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Completion Rate</h3>
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Overdue Tasks</h3>
                <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Status Pie Chart */}
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              Task Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
              Priority Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects and Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
                Your Projects
              </h3>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project._id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="mt-3">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'Active' ? 'bg-green-100 text-green-800' :
                        project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Recent Tasks
              </h3>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {tasks.slice(0, 5).map(task => (
                  <div key={task._id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Todo">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
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