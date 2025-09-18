import { ConvexError, v } from 'convex/values'
import {
  contentHashFromArrayBuffer,
  Entry,
  EntryId,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from '@convex-dev/rag'

import { action, query, QueryCtx } from './_generated/server'
import { extractTextContent } from './lib/extractTextContent'
import rag from './ai/rag'
import { Id } from './_generated/dataModel'
import { paginationOptsValidator } from 'convex/server'

const guessMimeType = (filename: string, bytes: ArrayBuffer): string => {
  return (
    guessMimeTypeFromExtension(filename) ||
    guessMimeTypeFromContents(bytes) ||
    'application/octet-stream'
  )
}

function namespaceFor(identitySubject: string, articleId: Id<'articles'>) {
  return `${identitySubject}:${articleId}`
}

export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    sourceType: v.union(
      v.literal('pdf'),
      v.literal('link'),
      v.literal('youtube'),
      v.literal('text')
    ),
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

    const { bytes, filename, sourceType, articleId } = args

    const mimeType = args.mimeType || guessMimeType(filename, bytes)
    const blob = new Blob([bytes], { type: mimeType })

    const storageId = await ctx.storage.store(blob)

    const text = await extractTextContent(ctx, {
      storageId,
      filename,
      bytes,
      mimeType,
    })

    const { entryId, created } = await rag.add(ctx, {
      // Use per-article namespace to isolate sources per article
      namespace: namespaceFor(identity.subject, articleId),
      text,
      key: filename,
      title: filename,
      metadata: {
        storageId,
        uploadedBy: identity.subject,
        filename,
        sourceType,
        articleId,
      } as EntryMetadata,
      contentHash: await contentHashFromArrayBuffer(bytes), // To avoid re-inserting if the file content hasn't changed
    })

    if (!created) {
      console.debug('Entry already exists, skipping upload metadata')
      await ctx.storage.delete(storageId)
    }

    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    }
  },
})

export const list = query({
  args: {
    articleId: v.id('articles'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Identity not found',
      })
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: namespaceFor(identity.subject, args.articleId),
    })

    if (!namespace) {
      return { page: [], isDone: true, continueCursor: '' }
    }

    const results = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      paginationOpts: args.paginationOpts,
    })

    const files = await Promise.all(
      results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
    )

    return {
      page: files,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    }
  },
})

export type PublicFile = {
  id: EntryId
  name: string
  type: string
  status: 'ready' | 'processing' | 'error'
  url: string | null
  sourceType?: 'pdf' | 'link' | 'youtube' | 'text'
}

type EntryMetadata = {
  storageId: Id<'_storage'>
  uploadedBy: string
  filename: string
  sourceType: 'pdf' | 'link' | 'youtube' | 'text'
  articleId: Id<'articles'>
}

async function convertEntryToPublicFile(
  ctx: QueryCtx,
  entry: Entry
): Promise<PublicFile> {
  const metadata = entry.metadata as EntryMetadata | undefined
  const storageId = metadata?.storageId

  const filename = entry.key || 'Unknown'
  const extension = filename.split('.').pop()?.toLowerCase() || 'txt'

  let status: 'ready' | 'processing' | 'error' = 'error'
  if (entry.status === 'ready') {
    status = 'ready'
  } else if (entry.status === 'pending') {
    status = 'processing'
  }

  const url = storageId ? await ctx.storage.getUrl(storageId) : null

  return {
    id: entry.entryId,
    name: filename,
    type: extension,
    status,
    url,
    sourceType: metadata?.sourceType || undefined,
  }
}
