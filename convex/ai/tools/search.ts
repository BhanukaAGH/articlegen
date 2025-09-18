import { z } from 'zod'
import { createTool } from '@convex-dev/agent'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import rag from '../rag'
import { SEARCH_INTERPRETER_PROMPT } from '../constants'

function namespaceFor(identitySubject: string, articleId: string) {
  return `${identitySubject}:${articleId}`
}

export const search = createTool({
  description:
    'Search the knowledge base for relevant information to help answer user questions',
  args: z.object({
    query: z.string().describe('The search query to find relevant information'),
  }),
  handler: async (ctx, args, options) => {
    const identity = await ctx.auth.getUserIdentity()

    const searchResult = await rag.search(ctx, {
      namespace: namespaceFor(
        identity!.subject,
        (options.experimental_context as unknown as { articleId: string })
          .articleId
      ),
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

    return response.text
  },
})
