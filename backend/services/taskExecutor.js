const { Octokit } = require('@octokit/rest');
const Task = require('../models/Task');
const Repository = require('../models/Repository');
const User = require('../models/User');
const { generateCode, reviewCode } = require('./aiService');

/**
 * Execute a task - generate code and push to GitHub
 * @param {string} taskId - Task ID to execute
 */
async function executeTask(taskId) {
  const task = await Task.findById(taskId).populate('repositoryId').populate('userId');
  
  if (!task) {
    throw new Error('Task not found');
  }

  try {
    task.status = 'in_progress';
    await task.save();

    const repository = task.repositoryId;
    const user = task.userId;

    // Initialize Octokit with user's GitHub token
    const octokit = new Octokit({
      auth: user.accessToken,
    });

    // Parse owner and repo name from fullName
    const [owner, repo] = repository.fullName.split('/');

    // Process each step in the plan
    for (const step of task.plan) {
      if (step.status === 'completed') continue;

      try {
        step.status = 'in_progress';
        await task.save();

        // Generate code for each file in the step
        for (const filePath of step.files) {
          try {
            // Determine language from file extension
            const language = getLanguageFromExtension(filePath);
            
            // Generate code
            const code = await generateCode(
              filePath,
              `Implement ${step.description} in ${filePath}`,
              language
            );

            // Review the generated code
            const review = await reviewCode(code, filePath);
            
            // If there are critical issues, regenerate
            if (review.issues.length > 3) {
              console.log(`Regenerating code for ${filePath} due to quality issues`);
              // Could add regeneration logic here
            }

            // Store generated code
            task.generatedCode.push({
              filePath,
              content: code,
              language,
            });

            // Push to GitHub
            const commitResult = await pushToGitHub(
              octokit,
              owner,
              repo,
              filePath,
              code,
              `feat: ${step.description}`
            );

            task.commits.push({
              sha: commitResult.sha,
              message: commitResult.message,
              timestamp: new Date(),
            });

            console.log(`✅ Pushed ${filePath} to GitHub`);
          } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
            step.status = 'failed';
            task.errorMessage = `Failed to process ${filePath}: ${error.message}`;
            await task.save();
          }
        }

        step.status = 'completed';
        await task.save();
      } catch (error) {
        console.error(`Error executing step ${step.step}:`, error);
        step.status = 'failed';
        await task.save();
      }
    }

    // Mark task as completed
    task.status = 'completed';
    task.completedAt = Date.now();
    await task.save();

    console.log(`✅ Task ${task._id} completed successfully`);
  } catch (error) {
    console.error('Task execution error:', error);
    task.status = 'failed';
    task.errorMessage = error.message;
    await task.save();
    throw error;
  }
}

/**
 * Push file content to GitHub
 * @param {Octokit} octokit - Octokit instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - File path
 * @param {string} content - File content
 * @param {string} message - Commit message
 */
async function pushToGitHub(octokit, owner, repo, path, content, message) {
  try {
    // Get the default branch
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const branch = repoData.default_branch;

    // Check if file exists
    let sha = null;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      sha = data.sha;
    } catch (error) {
      // File doesn't exist, that's okay
      if (error.status !== 404) {
        throw error;
      }
    }

    // Create/update file
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch,
    });

    return {
      sha: data.commit.sha,
      message: data.commit.message,
    };
  } catch (error) {
    console.error('GitHub push error:', error);
    throw new Error(`Failed to push to GitHub: ${error.message}`);
  }
}

/**
 * Get programming language from file extension
 * @param {string} filePath - File path
 * @returns {string}
 */
function getLanguageFromExtension(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rs: 'rust',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'bash',
  };

  return languageMap[ext] || 'text';
}

module.exports = {
  executeTask,
  pushToGitHub,
};
