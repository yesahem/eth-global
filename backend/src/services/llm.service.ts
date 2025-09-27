import axios from 'axios';
import { config } from '../config';

export class LLMService {
  async summarizeMemories(memories: string[]): Promise<string> {
    if (config.openai.apiKey) {
      try {
        const response = await axios.post(
          config.openai.baseUrl,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'Summarize the following AI agent memories into a concise summary. Focus on key actions, decisions, and patterns.'
              },
              {
                role: 'user',
                content: `Memories to summarize:\n${memories.join('\n---\n')}`
              }
            ],
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${config.openai.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI summarization failed:', error);
      }
    }

    // Fallback to simple summarization
    console.log('🤖 Using fallback summarization...');
    return `Summary of ${memories.length} memories: ${memories.join(' | ').substring(0, 200)}...`;
  }
}