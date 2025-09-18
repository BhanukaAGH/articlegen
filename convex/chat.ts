import { ConvexError, v } from 'convex/values'
import { action } from './_generated/server'

import { articleAgent } from './ai/agents/articleAgent'

export const extractKeyPoints = action({
  args: {
    articleId: v.id('articles'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Identity not found',
      })
    }

    const { threadId } = await articleAgent.createThread(ctx, {
      userId: identity.subject,
    })

    await articleAgent.generateText(
      ctx,
      { threadId },
      {
        prompt: `I want to write an article based on the provided source documents. I have not decided on a specific topic or title yet. Your task is to help me by extracting the most important key points from all the sources.

To do this, you MUST use the \`searchTool\` to explore the content of the sources. Perform one or more searches to gather comprehensive information.

Based on your search results, identify and list the main facts, arguments, and data points that would be essential for an article. Present the output as a concise list of key points.`,
        experimental_context: { articleId: args.articleId },
      }
    )

    const response = await articleAgent.generateText(
      ctx,
      { threadId },
      {
        prompt: `Given the previous discussion and extracted information, summarize only the most essential key points that should be included in an article. Focus on the core ideas and insights necessary for a comprehensive and informative article, avoiding repetition or less relevant details.`,
        experimental_context: { articleId: args.articleId },
      }
    )

    return response.text
  },
})
