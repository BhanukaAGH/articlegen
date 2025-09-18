import { z } from 'zod'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createTool } from '@convex-dev/agent'

import rag from '../rag'

import { SEARCH_INTERPRETER_PROMPT } from '../constants'
import { articleAgent } from '../agents/articleAgent'

export const search = createTool({
  description:
    'Search the knowledge base for relevant information to help answer user questions',
  args: z.object({
    query: z.string().describe('The search query to find relevant information'),
  }),
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      return 'Missing thread Id'
    }

    const searchResult = await rag.search(ctx, {
      namespace: ctx.threadId,
      query: args.query,
      limit: 5,
    })

    const contextText = `Found results in ${searchResult.entries
      .map((e) => e.title || null)
      .filter((t) => t !== null)
      .join(', ')}. Here is the context:\n\n${searchResult.text}`

    const response = await generateText({
      messages: [
        {
          role: 'system',
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: 'user',
          content: `User asked: "${args.query}"\n\nSearch results: ${contextText}`,
        },
      ],
      model: openai.chat('gpt-4o-mini'),
    })

    await articleAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: 'assistant',
        content: response.text,
      },
    })

    return response.text
  },
})
