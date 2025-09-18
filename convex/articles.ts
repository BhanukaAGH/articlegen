import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { paginationOptsValidator } from 'convex/server'

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

export const generateArticle = mutation({
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
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw new ConvexError('Unauthorized')
    }

    const article = await ctx.db.get(args.articleId)
    if (!article) {
      throw new ConvexError('Article not found')
    }

    if (article.userId !== user.subject) {
      throw new ConvexError('Unauthorized')
    }

    // Get article settings
    const { length, tone, angle } = article.settings

    // Define length parameters
    const lengthGuides = {
      short: '500-800 words',
      medium: '1000-1500 words',
      long: '2000-3000 words',
    }

    // Construct the base prompt
    const basePrompt = `You are an expert article writer with deep knowledge in creating engaging and informative content.
    
Task: Generate a ${lengthGuides[length as keyof typeof lengthGuides]} article using the following key points and parameters:

Key Points:
${args.keyPoints}

Writing Parameters:
- Tone: ${tone} - ${getToneGuide(tone as string)}
- Angle: ${angle} - ${getAngleGuide(angle as string)}
- Length: Target ${lengthGuides[length as keyof typeof lengthGuides]}

Requirements:
1. Maintain a ${tone} tone throughout the article
2. Structure the article following the ${angle} approach
3. Include relevant sections, headings, and subheadings
4. Ensure smooth transitions between key points
5. Conclude with a strong summary or call-to-action

Please generate a well-structured article that incorporates all the key points while maintaining the specified tone and angle.`

    // TODO: Integrate with your preferred AI service (OpenAI, Anthropic, etc.)
    // For now, returning a placeholder
    const generatedContent =
      'Implementation needed: Connect to your preferred AI service'

    // Update the article with generated content
    await ctx.db.patch(args.articleId, {
      generatedContent,
      status: 'completed' as const,
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
