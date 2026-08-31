import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Code, GitCommit, Rocket } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

function Dashboard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const handleLogin = () => {
    authAPI.loginWithGitHub();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Code className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MERN Coding Agent
            </h1>
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Hello, {user?.username}</span>
              <Link
                to="/repositories"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>Connect GitHub</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <Rocket className="w-24 h-24 mx-auto text-purple-400 mb-6" />
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Code Generation
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Connect your GitHub repository and let our AI agent write, commit, and push 
              production-grade code directly to your repository.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              icon={<Code className="w-8 h-8 text-purple-400" />}
              title="Smart Code Generation"
              description="AI writes production-ready code following best practices and modern patterns."
            />
            <FeatureCard
              icon={<GitCommit className="w-8 h-8 text-pink-400" />}
              title="Automatic Commits"
              description="Every change is committed with meaningful messages and pushed to your repo."
            />
            <FeatureCard
              icon={<Github className="w-8 h-8 text-blue-400" />}
              title="GitHub Integration"
              description="Seamlessly connect with your GitHub repositories and manage them from one place."
            />
          </div>

          {/* CTA */}
          {!isAuthenticated && (
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Get Started - Connect Your GitHub
            </button>
          )}

          {isAuthenticated && (
            <Link
              to="/repositories"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>Built with ❤️ using MERN Stack and AI</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

export default Dashboard;
