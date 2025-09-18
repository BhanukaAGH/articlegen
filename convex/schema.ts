import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    userId: v.string(),
    status: v.union(v.literal('draft'), v.literal('completed')),
    settings: v.object({
      tone: v.optional(v.string()), // formal, conversational, professional
      targetLength: v.optional(v.number()), // target word count
      customPrompt: v.optional(v.string()), // custom generation prompt
    }),
    generatedContent: v.optional(v.string()),
  }).index('by_userId', ['userId']),
})
