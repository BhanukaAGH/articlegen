import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { StorageActionWriter } from 'convex/server'
import { assert } from 'convex-helpers'
import { Id } from '../_generated/dataModel'

const AI_MODELS = {
  pdf: openai.chat('gpt-4o-mini'),
  txt: openai.chat('gpt-4o-mini'),
} as const

const SYSTEM_PROMPTS = {
  pdf: 'You transform PDF files into text.',
  txt: 'You transform text files into text.',
}

export type ExtractTextContentArgs = {
  storageId: Id<'_storage'>
  filename: string
  bytes?: ArrayBuffer
  mimeType: string
}

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs
): Promise<string> {
  const { storageId, filename, bytes, mimeType } = args

  const url = await ctx.storage.getUrl(storageId)
  assert(url, 'Failed to get storae URL')

  if (mimeType.toLowerCase().includes('pdf')) {
    return extractPdfText(url, mimeType, filename)
  }

  if (mimeType.toLowerCase().includes('text')) {
    return extractTextFileContent(ctx, storageId, bytes, mimeType)
  }

  throw new Error(`Unsupported MIME type: ${mimeType}`)
}

async function extractTextFileContent(
  ctx: { storage: StorageActionWriter },
  storageId: Id<'_storage'>,
  bytes: ArrayBuffer | undefined,
  mimeType: string
): Promise<string> {
  const arrayBuffer =
    bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer())

  if (!arrayBuffer) {
    throw new Error('Failed to get file content.')
  }

  const text = new TextDecoder().decode(arrayBuffer)

  if (mimeType.toLowerCase() !== 'text/plain') {
    const result = await generateText({
      model: AI_MODELS.txt,
      system: SYSTEM_PROMPTS.txt,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text },
            {
              type: 'text',
              text: "Extract the text and print it without explaining that you'll do so",
            },
          ],
        },
      ],
    })

    return result.text
  }

  return text
}

async function extractPdfText(
  url: string,
  mimeType: string,
  filename: string
): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPTS.pdf,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'file', data: new URL(url), mediaType: mimeType, filename },
          {
            type: 'text',
            text: "Extract the text from the PDF and print it without explaining you'll do so.",
          },
        ],
      },
    ],
  })

  return result.text
}
