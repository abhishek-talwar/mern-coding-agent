const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Repository = require('../models/Repository');
const authMiddleware = require('../middleware/auth');
const { generatePlan } = require('../services/aiService');

// Create a new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { repositoryId, title, description } = req.body;

    if (!repositoryId || !title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Repository ID, title, and description are required' 
      });
    }

    // Verify repository ownership
    const repository = await Repository.findOne({
      _id: repositoryId,
      ownerId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ 
        success: false, 
        message: 'Repository not found' 
      });
    }

    // Generate AI plan
    const plan = await generatePlan(description);

    // Create task
    const task = await Task.create({
      userId: req.user._id,
      repositoryId,
      title,
      description,
      status: 'planning',
      plan: plan.steps.map((step, index) => ({
        step: index + 1,
        description: step.description,
        files: step.files || [],
        status: 'pending',
      })),
    });

    res.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create task' 
    });
  }
});

// Get all tasks for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .populate('repositoryId', 'name fullName')
      .sort('-createdAt');
    
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tasks' 
    });
  }
});

// Get single task
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('repositoryId', 'name fullName htmlUrl');

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch task' 
    });
  }
});

// Approve task and start execution
router.post('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    task.status = 'in_progress';
    task.startedAt = Date.now();
    await task.save();

    // Start task execution (in background)
    const { executeTask } = require('../services/taskExecutor');
    executeTask(task._id).catch(err => {
      console.error('Task execution error:', err);
    });

    res.json({ 
      success: true, 
      message: 'Task approved and execution started' 
    });
  } catch (error) {
    console.error('Error approving task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve task' 
    });
  }
});

// Get task status
router.get('/:id/status', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('status plan commits errorMessage');

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Error fetching task status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch task status' 
    });
  }
});

module.exports = router;
