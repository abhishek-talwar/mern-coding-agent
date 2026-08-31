# MERN Coding Agent 🤖

An intelligent AI-powered coding agent that connects to your GitHub repository and autonomously writes, commits, and pushes production-grade code.

## Features ✨

- **GitHub Integration**: Connect your repository and let the agent manage your codebase
- **AI-Powered Code Generation**: Leverages LLMs to write production-ready code
- **Automatic Commits & Pushes**: Handles git operations automatically
- **MERN Stack Support**: Specialized in MongoDB, Express.js, React, and Node.js
- **README Generation**: Automatically creates and updates documentation
- **Code Review**: Implements best practices and coding standards
- **Task Management**: Break down complex requirements into manageable tasks

## Architecture 🏗️

```
mern-coding-agent/
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic (GitHub, AI, Git)
│   ├── models/             # Data models
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, validation
│   └── config/             # Configuration files
├── frontend/               # React UI
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API calls
│   │   └── utils/         # Helper functions
│   └── public/
├── agent/                  # Core AI Agent Logic
│   ├── planners/          # Task planning & breakdown
│   ├── coders/            # Code generation modules
│   ├── reviewers/         # Code quality checks
│   └── executors/         # Git operations
└── docs/                   # Documentation
```

## Prerequisites 📋

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- GitHub Personal Access Token
- OpenAI API Key (or other LLM provider)
- Git configured on your system

## Installation 🚀

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mern-coding-agent
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### 4. Agent Configuration

```bash
cd agent
npm install
# Configure your AI model and GitHub settings
```

## Environment Variables 🔐

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-agent
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

## Usage 💻

### 1. Connect Your GitHub Repository

- Navigate to the dashboard
- Click "Connect GitHub"
- Authorize the application
- Select the repository you want the agent to work on

### 2. Create a Task

Provide a natural language description of what you want to build:

```
"Create a user authentication system with login, signup, and password reset functionality"
```

### 3. Review Plan

The agent will break down the task into steps:
- Create User model with bcrypt password hashing
- Set up Express routes for auth endpoints
- Build React login/signup forms
- Implement JWT token management
- Add password reset email flow

### 4. Approve & Execute

Review the planned changes and approve. The agent will:
- Write the code following best practices
- Create commits with meaningful messages
- Push to your repository
- Update the README

## API Endpoints 🌐

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/github` | GitHub OAuth login |
| GET | `/api/repos` | List connected repositories |
| POST | `/api/tasks` | Create a new coding task |
| GET | `/api/tasks/:id` | Get task details |
| POST | `/api/tasks/:id/approve` | Approve task execution |
| GET | `/api/tasks/:id/status` | Check task progress |
| GET | `/api/commits` | View recent commits |

## Security 🔒

- OAuth 2.0 for GitHub authentication
- JWT tokens for session management
- Encrypted storage of access tokens
- Rate limiting on API endpoints
- Input validation and sanitization

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

MIT License - feel free to use this project for personal or commercial purposes.

## Roadmap 🗺️

- [ ] Multi-repository support
- [ ] CI/CD pipeline integration
- [ ] Automated testing generation
- [ ] Pull request creation
- [ ] Team collaboration features
- [ ] Custom AI model fine-tuning
- [ ] Plugin system for extensibility

## Support 💬

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using MERN Stack and AI