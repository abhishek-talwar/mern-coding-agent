const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a plan for implementing a feature
 * @param {string} description - Task description
 * @returns {Promise<{steps: Array}>}
 */
async function generatePlan(description) {
  const prompt = `You are an expert software architect. Break down the following task into clear, actionable steps for a MERN stack application.

Task: ${description}

Provide a JSON response with the following structure:
{
  "steps": [
    {
      "description": "Step description",
      "files": ["path/to/file1.js", "path/to/file2.jsx"]
    }
  ]
}

Consider:
- Backend API routes and controllers
- Database models
- Frontend components
- Authentication/authorization if needed
- Best practices and code organization

Return ONLY valid JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert software architect specializing in MERN stack applications. You provide clear, actionable implementation plans.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    const parsed = JSON.parse(response);
    
    return parsed;
  } catch (error) {
    console.error('Error generating plan:', error);
    throw new Error('Failed to generate implementation plan');
  }
}

/**
 * Generate code for a specific file
 * @param {string} filePath - Path of the file
 * @param {string} description - What the file should do
 * @param {string} language - Programming language
 * @returns {Promise<string>}
 */
async function generateCode(filePath, description, language = 'javascript') {
  const prompt = `Generate production-grade code for the following file:

File: ${filePath}
Language: ${language}
Purpose: ${description}

Requirements:
- Follow best practices and coding standards
- Include proper error handling
- Add comments where necessary
- Use modern syntax (ES6+)
- Include appropriate imports/exports
- Make it production-ready

Return ONLY the code, no explanations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${language} developer. You write clean, efficient, production-ready code following best practices.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating code:', error);
    throw new Error(`Failed to generate code for ${filePath}`);
  }
}

/**
 * Review code for quality and best practices
 * @param {string} code - Code to review
 * @param {string} filePath - File path
 * @returns {Promise<{issues: Array, suggestions: Array}>}
 */
async function reviewCode(code, filePath) {
  const prompt = `Review the following code for quality, best practices, and potential issues:

File: ${filePath}

Code:
${code}

Provide feedback on:
- Code quality and readability
- Potential bugs or issues
- Security concerns
- Performance optimizations
- Best practices adherence

Return JSON with structure:
{
  "issues": ["list of issues found"],
  "suggestions": ["list of improvement suggestions"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. You provide constructive, actionable feedback on code quality.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Error reviewing code:', error);
    return { issues: [], suggestions: [] };
  }
}

module.exports = {
  generatePlan,
  generateCode,
  reviewCode,
};
