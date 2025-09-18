import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    userId: v.string(),
    status: v.union(v.literal('draft'), v.literal('completed')),
    settings: v.object({
      length: v.optional(v.string()), // short, medium, long
      tone: v.optional(v.string()), // professional, casual, technical, conversational
      angle: v.optional(v.string()), // problem-solution, expert-analysis, case-study, industry-trends
      customPrompt: v.optional(v.string()), // custom generation prompt
    }),
    generatedContent: v.optional(v.string()),
  }).index('by_userId', ['userId']),
})
