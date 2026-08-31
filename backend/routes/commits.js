const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

// Get all commits from tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      userId: req.user._id,
      status: 'completed',
    })
    .populate('repositoryId', 'name fullName')
    .select('commits repositoryId title')
    .sort('-completedAt')
    .limit(50);

    // Flatten commits from all tasks
    const allCommits = tasks.flatMap(task => 
      task.commits.map(commit => ({
        ...commit.toObject(),
        taskTitle: task.title,
        repository: task.repositoryId,
      }))
    );

    res.json({ success: true, commits: allCommits });
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch commits' 
    });
  }
});

// Get commits for a specific task
router.get('/task/:taskId', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.user._id,
    }).populate('repositoryId', 'name fullName');

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    res.json({ success: true, commits: task.commits });
  } catch (error) {
    console.error('Error fetching task commits:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch task commits' 
    });
  }
});

module.exports = router;
