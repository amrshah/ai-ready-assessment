import { Question } from './types';

export const QUESTIONS: Question[] = [
  // Strategy
  { id: 1, pillar: 'Strategy', text: 'I regularly use AI to assist in real work tasks rather than just experimenting.' },
  { id: 2, pillar: 'Strategy', text: 'I have a clear understanding of which tasks in my role are best suited for AI assistance.' },
  { id: 3, pillar: 'Strategy', text: 'I actively look for new ways to integrate AI into my professional output.' },
  { id: 4, pillar: 'Strategy', text: 'I consider the ethical and privacy implications before using AI with sensitive data.' },
  { id: 5, pillar: 'Strategy', text: 'I have a defined goal for how much time I want to save using AI each week.' },
  
  // Skills
  { id: 6, pillar: 'Skills', text: 'I am confident in my ability to write effective, structured prompts for high-quality results.' },
  { id: 7, pillar: 'Skills', text: 'I verify and refine AI outputs for accuracy and "human" quality before using them.' },
  { id: 8, pillar: 'Skills', text: 'I know how to use advanced techniques like "Chain of Thought" or "Few-Shot" prompting.' },
  { id: 9, pillar: 'Skills', text: 'I can quickly identify when an AI is "hallucinating" or providing incorrect information.' },
  { id: 10, pillar: 'Skills', text: 'I know how to use AI for research, writing, and complex data analysis.' },
  
  // Workflows
  { id: 11, pillar: 'Workflows', text: 'I have repeatable prompts or workflow templates that I reuse for common tasks.' },
  { id: 12, pillar: 'Workflows', text: 'AI is a core part of my daily productivity stack, not just an occasional tool.' },
  { id: 13, pillar: 'Workflows', text: 'I have successfully automated at least one multi-step workflow using AI tools.' },
  { id: 14, pillar: 'Workflows', text: 'I use AI to bridge gaps between different software tools I use (e.g., summarizing meetings for tasks).' },
  { id: 15, pillar: 'Workflows', text: 'I regularly update my workflows as new AI models and features are released.' },
  
  // Systems
  { id: 16, pillar: 'Systems', text: 'I use professional-grade AI tools or paid subscriptions for better performance and features.' },
  { id: 17, pillar: 'Systems', text: 'I have a system for organizing and storing my most effective prompts.' },
  { id: 18, pillar: 'Systems', text: 'I use AI agents or automated pipelines (like Zapier/Make) to handle repetitive work.' },
  { id: 19, pillar: 'Systems', text: 'I have a clear method for tracking the productivity gains I get from AI usage.' },
  { id: 20, pillar: 'Systems', text: 'I am prepared to scale my AI usage if my workload or team size increases.' },
];

export const READINESS_LEVELS = [
  { min: 0, max: 25, label: 'Explorer', description: 'You are just beginning to discover the potential of AI.' },
  { min: 26, max: 50, label: 'Beginner', description: 'You have started using AI tools but lack a structured approach.' },
  { min: 51, max: 75, label: 'Practitioner', description: 'You use AI effectively in your daily work and have some repeatable workflows.' },
  { min: 76, max: 100, label: 'AI Operator', description: 'AI is a core component of your systems and strategic advantage.' },
];
