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
