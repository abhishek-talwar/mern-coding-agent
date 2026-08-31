import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Github, Plus, Trash2, ExternalLink } from 'lucide-react';
import { repoAPI } from '../services/api';

function Repositories() {
  const queryClient = useQueryClient();
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);

  // Fetch connected repositories
  const { data: connectedData, isLoading: isLoadingConnected } = useQuery({
    queryKey: ['connectedRepos'],
    queryFn: async () => {
      const { data } = await repoAPI.getConnectedRepos();
      return data.repositories;
    },
  });

  // Fetch GitHub repositories
  const { data: githubData, isLoading: isLoadingGitHub } = useQuery({
    queryKey: ['githubRepos'],
    queryFn: async () => {
      const { data } = await repoAPI.getGitHubRepos();
      return data.repositories;
    },
    enabled: showGitHubRepos,
  });

  // Connect repository mutation
  const connectMutation = useMutation({
    mutationFn: (repoId) => repoAPI.connectRepo(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['connectedRepos']);
      setShowGitHubRepos(false);
    },
  });

  // Disconnect repository mutation
  const disconnectMutation = useMutation({
    mutationFn: (repoId) => repoAPI.disconnectRepo(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['connectedRepos']);
    },
  });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4">Connect Repositories</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Connected Repositories */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Connected Repositories</h2>
            <button
              onClick={() => setShowGitHubRepos(!showGitHubRepos)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Connect New Repository</span>
            </button>
          </div>

          {isLoadingConnected ? (
            <p className="text-slate-400">Loading...</p>
          ) : connectedData?.length === 0 ? (
            <div className="p-8 bg-slate-800 rounded-lg text-center text-slate-400">
              No repositories connected yet. Click "Connect New Repository" to get started.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedData?.map((repo) => (
                <RepositoryCard
                  key={repo._id}
                  repo={repo}
                  isConnected={true}
                  onDisconnect={() => disconnectMutation.mutate(repo._id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* GitHub Repositories Modal */}
        {showGitHubRepos && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select a Repository</h2>
                <button
                  onClick={() => setShowGitHubRepos(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {isLoadingGitHub ? (
                <p className="text-slate-400">Loading repositories...</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {githubData?.map((repo) => (
                    <RepositoryCard
                      key={repo.id}
                      repo={repo}
                      isGitHubRepo={true}
                      onConnect={() => connectMutation.mutate(repo.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function RepositoryCard({ repo, isConnected, isGitHubRepo, onConnect, onDisconnect }) {
  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <Github className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold">{repo.name || repo.fullName}</h3>
        </div>
        {isConnected && (
          <a
            href={repo.htmlUrl || repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-purple-400"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <p className="text-sm text-slate-400 mb-4">
        {repo.description || repo.description || 'No description'}
      </p>

      <div className="flex items-center space-x-2">
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            disabled={isGitHubRepo === false}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default Repositories;
