const express = require('express');
const router = express.Router();
const { Octokit } = require('@octokit/rest');
const Repository = require('../models/Repository');
const authMiddleware = require('../middleware/auth');

// Get user's repositories from GitHub
router.get('/', authMiddleware, async (req, res) => {
  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    // Fetch user's repositories
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });

    res.json({ success: true, repositories: repos });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch repositories' 
    });
  }
});

// Connect a repository
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    const { repoId } = req.body;

    if (!repoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Repository ID is required' 
      });
    }

    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    // Get repository details
    const { data: repo } = await octokit.repos.get({ repo_id: repoId });

    // Check if repository already connected
    let repository = await Repository.findOne({
      ownerId: req.user._id,
      githubId: repo.id,
    });

    if (!repository) {
      repository = await Repository.create({
        ownerId: req.user._id,
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        isPrivate: repo.private,
      });

      // Add to user's connected repos
      req.user.connectedRepos.push(repository._id);
      await req.user.save();
    }

    res.json({ success: true, repository });
  } catch (error) {
    console.error('Error connecting repository:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect repository' 
    });
  }
});

// Get connected repositories
router.get('/connected', authMiddleware, async (req, res) => {
  try {
    const repositories = await Repository.find({ ownerId: req.user._id });
    res.json({ success: true, repositories });
  } catch (error) {
    console.error('Error fetching connected repositories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch connected repositories' 
    });
  }
});

// Disconnect a repository
router.delete('/:repoId', authMiddleware, async (req, res) => {
  try {
    const { repoId } = req.params;

    await Repository.findOneAndDelete({
      _id: repoId,
      ownerId: req.user._id,
    });

    // Remove from user's connected repos
    req.user.connectedRepos = req.user.connectedRepos.filter(
      id => id.toString() !== repoId
    );
    await req.user.save();

    res.json({ success: true, message: 'Repository disconnected' });
  } catch (error) {
    console.error('Error disconnecting repository:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to disconnect repository' 
    });
  }
});

module.exports = router;
