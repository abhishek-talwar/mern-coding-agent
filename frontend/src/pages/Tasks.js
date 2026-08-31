import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:parameter name="path" value="/workspace/frontend/src/pages/Tasks.js" />
import { Link } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { taskAPI, repoAPI } from '../services/api';

function Tasks() {
  const queryClient = useQueryClient();
  const [showNewTask, setShowNewTask] = useState(false);

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await taskAPI.getTasks();
      return data.tasks;
    },
  });

  // Fetch connected repos for dropdown
  const { data: reposData } = useQuery({
    queryKey: ['connectedRepos'],
    queryFn: async () => {
      const { data } = await repoAPI.getConnectedRepos();
      return data.repositories;
    },
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <Link to="/repositories" className="text-purple-400 hover:text-purple-300">
            ← Back to Repositories
          </Link>
          <div className="flex justify-between items-center mt-4">
            <h1 className="text-3xl font-bold">Tasks</h1>
            <button
              onClick={() => setShowNewTask(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-slate-400">Loading tasks...</p>
        ) : tasksData?.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 mb-4">No tasks yet</p>
            <button
              onClick={() => setShowNewTask(true)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasksData?.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </main>

      {showNewTask && (
        <NewTaskModal
          repos={reposData || []}
          onClose={() => setShowNewTask(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['tasks']);
            setShowNewTask(false);
          }}
        />
      )}
    </div>
  );
}

function TaskCard({ task }) {
  const statusColors = {
    pending: 'bg-yellow-600/20 text-yellow-400',
    planning: 'bg-blue-600/20 text-blue-400',
    approved: 'bg-purple-600/20 text-purple-400',
    in_progress: 'bg-orange-600/20 text-orange-400',
    completed: 'bg-green-600/20 text-green-400',
    failed: 'bg-red-600/20 text-red-400',
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    planning: <FileText className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    in_progress: <Clock className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    failed: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <Link
      to={`/tasks/${task._id}`}
      className="block p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <p className="text-slate-400 text-sm mt-1">{task.description}</p>
          <p className="text-slate-500 text-xs mt-2">
            Repository: {task.repositoryId?.fullName || 'Unknown'}
          </p>
        </div>
        <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${statusColors[task.status]}`}>
          {statusIcons[task.status]}
          <span className="capitalize">{task.status.replace('_', ' ')}</span>
        </span>
      </div>
    </Link>
  );
}

function NewTaskModal({ repos, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => taskAPI.createTask(data),
    onSuccess: onSuccess,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      repositoryId: selectedRepo,
      title,
      description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Repository</label>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600"
              required
            >
              <option value="">Select a repository</option>
              {repos.map((repo) => (
                <option key={repo._id} value={repo._id}>
                  {repo.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600"
              placeholder="e.g., User Authentication System"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600"
              rows="4"
              placeholder="Describe what you want to build..."
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Tasks;
