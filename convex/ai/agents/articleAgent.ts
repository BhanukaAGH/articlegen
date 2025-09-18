import { Agent } from '@convex-dev/agent'
import { openai } from '@ai-sdk/openai'
import { components } from '../../_generated/api'
import { ARICLEGEN_AGENT_PROMPT } from '../constants'

export const articleAgent = new Agent(components.agent, {
  name: 'Article Agent',
  languageModel: openai.chat('gpt-4o-mini'),
  instructions: ARICLEGEN_AGENT_PROMPT,
})
