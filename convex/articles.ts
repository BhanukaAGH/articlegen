import { ConvexError, v } from 'convex/values'
import { action, internalAction, mutation, query } from './_generated/server'
import { paginationOptsValidator } from 'convex/server'
import { articleAgent } from './ai/agents/articleAgent'
import { stepCountIs } from '@convex-dev/agent'
import { api, internal } from './_generated/api'

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw new ConvexError('Unauthorized')
    }

    const articleId = await ctx.db.insert('articles', {
      title: 'Untitled article',
      userId: user.subject,
      status: 'draft',
      settings: {},
    })

    return articleId
  },
})

export const remove = mutation({
  args: {
    id: v.id('articles'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw new ConvexError('Unauthorized')
    }

    const article = await ctx.db.get(args.id)
    if (!article) {
      throw new ConvexError('Article not found')
    }

    if (article.userId !== user.subject) {
      throw new ConvexError('Unauthorized')
    }

    await ctx.db.delete(args.id)
  },
})

export const updateTitle = mutation({
  args: {
    id: v.id('articles'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw new ConvexError('Unauthorized')
    }

    const article = await ctx.db.get(args.id)

    if (!article) {
      throw new ConvexError('Article not found')
    }

    if (article.userId !== user.subject) {
      throw new ConvexError('Unauthorized')
    }

    await ctx.db.patch(args.id, {
      title: args.title,
    })
  },
})

// Queries
export const getOne = query({
  args: {
    id: v.id('articles'),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id)
    if (!article) {
      throw new ConvexError('Article not found')
    }
    return article
  },
})

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw new ConvexError('Unauthorized')
    }

    return await ctx.db
      .query('articles')
      .withIndex('by_userId', (q) => q.eq('userId', user.subject))
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

export const updateArticle = mutation({
  args: {
    articleId: v.id('articles'),
    settings: v.object({
      length: v.string(),
      tone: v.string(),
      angle: v.string(),
      customPrompt: v.optional(v.string()),
    }),
    generatedContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new ConvexError('Unauthorized')
    }

    await ctx.db.patch(args.articleId, {
      settings: args.settings,
      generatedContent: args.generatedContent,
      status: 'completed' as const,
    })
  },
})

export const generateArticle = action({
  args: {
    articleId: v.id('articles'),
    keyPoints: v.string(),
    settings: v.object({
      length: v.string(),
      tone: v.string(),
      angle: v.string(),
      customPrompt: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new ConvexError('Unauthorized')
    }

    // Get article settings
    const { length, tone, angle } = args.settings

    // Define length parameters
    const lengthGuides = {
      short: '500-800 words',
      medium: '1000-1500 words',
      long: '2000-3000 words',
    }

    // Construct a concise, user-style prompt. Require Markdown-only output.
    const basePrompt = `Write a ${lengthGuides[length as keyof typeof lengthGuides]} article in Markdown using the key points below and the specified parameters.

- Start with a single H1 title line.
- Use clear sections with H2/H3 headings as appropriate.
- Maintain a ${tone} tone (${getToneGuide(tone as string)}).
- Follow the ${angle} approach (${getAngleGuide(angle as string)}).
- Integrate all key points with smooth transitions.
- End with a concise conclusion or call-to-action.
- Return only the final article in Markdown. Do not include any preamble, system messages, or code fences.

Key points:
${args.keyPoints}

Additional parameters:
- Target length: ${lengthGuides[length as keyof typeof lengthGuides]}
- Tone: ${tone}
- Angle: ${angle}

${args.settings.customPrompt ? `Extra instructions from the user:\n${args.settings.customPrompt}` : ''}`

    const { threadId } = await articleAgent.createThread(ctx, {
      userId: identity.subject,
    })

    const response = await articleAgent.generateText(
      ctx,
      {
        threadId,
      },
      { prompt: basePrompt, stopWhen: stepCountIs(3) }
    )
    const generatedContent = response.text

    await ctx.runMutation(api.articles.updateArticle, {
      articleId: args.articleId,
      settings: args.settings,
      generatedContent,
    })

    return generatedContent
  },
})

// Helper functions for prompt construction
function getToneGuide(tone: string): string {
  const toneGuides = {
    professional:
      'Use formal language, industry terminology, and maintain a business-appropriate tone',
    casual:
      'Write in a conversational, friendly manner while maintaining credibility',
    technical:
      'Focus on detailed explanations, use technical terms, and maintain precision',
    conversational:
      'Write as if having a dialogue with the reader, use natural language',
  }
  return toneGuides[tone as keyof typeof toneGuides] || ''
}

function getAngleGuide(angle: string): string {
  const angleGuides = {
    'problem-solution':
      'Present the problem clearly, then detail the solution with supporting evidence',
    'expert-analysis':
      'Provide deep insights and expert perspective on the topic',
    'case-study': 'Present real-world examples and analyze outcomes',
    'industry-trends':
      'Focus on current developments and future implications in the industry',
  }
  return angleGuides[angle as keyof typeof angleGuides] || ''
}
