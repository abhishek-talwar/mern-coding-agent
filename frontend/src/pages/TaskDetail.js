import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertCircle, FileCode, GitCommit } from 'lucide-react';
import { taskAPI } from '../services/api';

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: taskData, isLoading, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data } = await taskAPI.getTask(id);
      return data.task;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const approveMutation = useMutation({
    mutationFn: () => taskAPI.approveTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id]);
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading task...</p>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Task not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <Link to="/tasks" className="text-purple-400 hover:text-purple-300">
            ← Back to Tasks
          </Link>
          <h1 className="text-3xl font-bold mt-4">{taskData.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Task Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="p-6 bg-slate-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-slate-300">{taskData.description}</p>
            </div>

            {/* Plan */}
            {taskData.plan && taskData.plan.length > 0 && (
              <div className="p-6 bg-slate-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Implementation Plan</h2>
                <div className="space-y-4">
                  {taskData.plan.map((step, index) => (
                    <PlanStep key={index} step={step} />
                  ))}
                </div>
              </div>
            )}

            {/* Generated Code */}
            {taskData.generatedCode && taskData.generatedCode.length > 0 && (
              <div className="p-6 bg-slate-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Generated Files</h2>
                <div className="space-y-4">
                  {taskData.generatedCode.map((file, index) => (
                    <CodeFile key={index} file={file} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="p-6 bg-slate-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <StatusBadge status={taskData.status} />
              
              {taskData.status === 'planning' && (
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                >
                  {approveMutation.isPending ? 'Approving...' : 'Approve & Start'}
                </button>
              )}

              {taskData.errorMessage && (
                <div className="mt-4 p-3 bg-red-600/20 border border-red-600 rounded-lg">
                  <p className="text-red-400 text-sm">{taskData.errorMessage}</p>
                </div>
              )}
            </div>

            {/* Commits */}
            {taskData.commits && taskData.commits.length > 0 && (
              <div className="p-6 bg-slate-800 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <GitCommit className="w-5 h-5" />
                  <span>Commits</span>
                </h2>
                <div className="space-y-2">
                  {taskData.commits.map((commit, index) => (
                    <div key={index} className="p-3 bg-slate-700 rounded-lg">
                      <p className="text-sm font-mono text-purple-400">{commit.sha.slice(0, 7)}</p>
                      <p className="text-sm text-slate-300">{commit.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repository Info */}
            {taskData.repositoryId && (
              <div className="p-6 bg-slate-800 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Repository</h2>
                <a
                  href={taskData.repositoryId.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  {taskData.repositoryId.fullName} →
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PlanStep({ step }) {
  const statusColors = {
    pending: 'border-slate-600 text-slate-400',
    'in_progress': 'border-orange-500 text-orange-400',
    completed: 'border-green-500 text-green-400',
    failed: 'border-red-500 text-red-400',
  };

  const statusIcons = {
    pending: <Clock className="w-5 h-5" />,
    'in_progress': <Clock className="w-5 h-5 animate-pulse" />,
    completed: <CheckCircle className="w-5 h-5" />,
    failed: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div className={`p-4 border-l-4 ${statusColors[step.status]} bg-slate-700/50 rounded`}>
      <div className="flex items-start space-x-3">
        <div className="mt-1">{statusIcons[step.status]}</div>
        <div>
          <p className="font-medium">{step.description}</p>
          {step.files && step.files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {step.files.map((file, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-slate-600 rounded font-mono">
                  {file}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-600/20 text-yellow-400',
    planning: 'bg-blue-600/20 text-blue-400',
    approved: 'bg-purple-600/20 text-purple-400',
    in_progress: 'bg-orange-600/20 text-orange-400',
    completed: 'bg-green-600/20 text-green-400',
    failed: 'bg-red-600/20 text-red-400',
  };

  return (
    <span className={`inline-block px-4 py-2 rounded-full ${colors[status]}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}

function CodeFile({ file }) {
  return (
    <div className="p-4 bg-slate-700 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <FileCode className="w-5 h-5 text-purple-400" />
        <span className="font-mono text-sm">{file.filePath}</span>
      </div>
      <pre className="text-xs text-slate-300 overflow-x-auto">
        <code>{file.content.slice(0, 500)}{file.content.length > 500 ? '...' : ''}</code>
      </pre>
    </div>
  );
}

export default TaskDetail;
