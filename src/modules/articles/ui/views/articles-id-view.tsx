'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { CopyIcon, Download, Plus } from 'lucide-react'
import { useAction, usePaginatedQuery, useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArticleTitleForm } from '../components/article-title-form'
import { SourceUploadDialog } from '../components/source-upload-dialog'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { SourcesList } from '../components/source-list'

export const ArticleIdView = () => {
  const { articleId } = useParams()
  const article = useQuery(api.articles.getOne, {
    id: articleId as Id<'articles'>,
  })
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false)

  const {
    results: sources,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.files.list,
    { articleId: articleId as Id<'articles'> },
    { initialNumItems: 10 }
  )

  const [keyPoints, setKeyPoints] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [articleLength, setArticleLength] = useState<string>('')
  const [articleTone, setArticleTone] = useState<string>('')
  const [articleAngle, setArticleAngle] = useState<string>('')
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null)

  const extractKeyPointsAction = useAction(api.chat.extractKeyPoints)
  const generateArticleAction = useAction(api.articles.generateArticle)

  const handleExtractKeyPoints = async () => {
    setIsExtracting(true)
    try {
      const points = await extractKeyPointsAction({
        articleId: articleId as Id<'articles'>,
      })

      setKeyPoints(points)
    } catch (error) {
      console.error('Failed to extract key points', error)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleGenerateArticle = async () => {
    if (!keyPoints || !articleLength || !articleTone || !articleAngle) return

    setIsGenerating(true)
    try {
      const article = await generateArticleAction({
        articleId: articleId as Id<'articles'>,
        keyPoints,
        settings: {
          length: articleLength,
          tone: articleTone,
          angle: articleAngle,
        },
      })

      // Show generated article in the middle panel
      setGeneratedArticle(article)
    } catch (error) {
      console.error('Failed to generate article', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToClipboard = () => {
    if (generatedArticle) {
      navigator.clipboard.writeText(generatedArticle)
      toast.success('Article copied to clipboard!')
    }
  }

  const handleDownloadAsPdf = async () => {}

  return (
    <>
      <SourceUploadDialog
        open={sourceDialogOpen}
        onOpenChange={setSourceDialogOpen}
        articleId={articleId as Id<'articles'>}
      />
      <div className='min-h-screen bg-slate-950 text-white'>
        {/* Header */}
        <header className='flex items-center justify-between px-6 py-3 sticky top-0'>
          <div className=' flex items-center gap-3'>
            <Link href='/articles'>
              <div className='w-6 h-6 bg-white rounded flex items-center justify-center'>
                <div className='w-3 h-3 bg-slate-950 rounded' />
              </div>
            </Link>
            {article ? (
              <ArticleTitleForm
                articleId={article._id}
                initialTitle={article.title}
              />
            ) : (
              <h1 className='text-xl font-medium cursor-pointer'>ArticleGen</h1>
            )}
          </div>

          <UserButton
            showName
            appearance={{
              elements: {
                userButtonOuterIdentifier: 'text-white! pr-1',
                avatarBox: 'size-8!',
              },
            }}
          />
        </header>

        {/* Main Content */}
        <main className='px-6 py-3 flex gap-4 h-[calc(100vh-64px)] min-h-0'>
          {/* Sources Panel */}
          <div className='w-[300px] bg-slate-900 border border-slate-800 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-medium'>Sources</h2>

              <Button
                variant='secondary'
                size='sm'
                className='px-3'
                onClick={() => setSourceDialogOpen(true)}
              >
                <Plus className='h-4 w-4' />
                Add
              </Button>
            </div>
            <SourcesList
              sources={sources}
              status={status}
              loadMore={loadMore}
            />
          </div>

          {/* Chat Panel */}
          <div className='flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col'>
            {generatedArticle ? (
              <div className='flex h-full flex-col min-h-0'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-semibold'>Generated Article</h2>
                  <div className='flex items-center gap-2'>
                    <Button size='sm' onClick={handleCopyToClipboard}>
                      <CopyIcon />
                      Copy
                    </Button>
                    <Button onClick={handleDownloadAsPdf}>
                      <Download />
                      Download
                    </Button>
                  </div>
                </div>
                <div className='mt-4 prose prose-invert max-w-none text-slate-300 flex-1 whitespace-pre-wrap h-[calc(100%-4rem)]'>
                  <ScrollArea className='h-full w-full overflow-auto'>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {generatedArticle}
                    </ReactMarkdown>
                  </ScrollArea>
                </div>
              </div>
            ) : keyPoints ? (
              <div className='flex h-full flex-col min-h-0'>
                <h2 className='text-xl font-semibold'>Key Points</h2>
                <div className='mt-4 prose prose-invert max-w-none text-slate-300 flex-1 whitespace-pre-wrap h-[calc(100%-4rem)]'>
                  <ScrollArea className='h-full w-full overflow-auto'>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {keyPoints}
                    </ReactMarkdown>
                  </ScrollArea>
                </div>
              </div>
            ) : isExtracting ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <p>Extracting key points...</p>
                </div>
              </div>
            ) : sources && sources.length > 0 ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <h3 className='text-lg font-medium mb-2'>
                    Ready to extract key points
                  </h3>
                  <Button
                    variant='secondary'
                    onClick={handleExtractKeyPoints}
                    disabled={isExtracting}
                  >
                    {isExtracting ? 'Extracting...' : 'Extract Key Points'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <h3 className='text-lg font-medium mb-2'>
                    Add a source to get started
                  </h3>
                  <Button
                    variant='secondary'
                    onClick={() => setSourceDialogOpen(true)}
                  >
                    Upload a source
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className='w-[300px] bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-full'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-medium'>Settings</h2>
            </div>

            <div className='flex flex-col flex-1 space-y-6'>
              {/* Article Length */}
              <div>
                <h3 className='text-sm font-medium mb-3'>Article Length</h3>
                <div className='grid grid-cols-3 gap-2'>
                  {['Short', 'Medium', 'Long'].map((length) => (
                    <Button
                      key={length}
                      variant='outline'
                      size='sm'
                      className={`w-full hover:text-muted ${
                        articleLength === length.toLowerCase()
                          ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'
                          : 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                      onClick={() => setArticleLength(length.toLowerCase())}
                    >
                      {length}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Article Tone */}
              <div>
                <h3 className='text-sm font-medium mb-3'>Tone</h3>
                <div className='grid grid-cols-2 gap-2'>
                  {[
                    'Professional',
                    'Casual',
                    'Technical',
                    'Conversational',
                  ].map((tone) => (
                    <Button
                      key={tone}
                      variant='outline'
                      size='sm'
                      className={`w-full hover:text-muted ${
                        articleTone === tone.toLowerCase()
                          ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'
                          : 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                      onClick={() => setArticleTone(tone.toLowerCase())}
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Article Angle */}
              <div>
                <h3 className='text-sm font-medium mb-3'>Story Angle</h3>
                <div className='grid grid-cols-1 gap-2'>
                  {[
                    'Problem-Solution',
                    'Expert Analysis',
                    'Case Study',
                    'Industry Trends',
                  ].map((angle) => (
                    <Button
                      key={angle}
                      variant='outline'
                      size='sm'
                      className={`w-full hover:text-muted ${
                        articleAngle === angle.toLowerCase()
                          ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'
                          : 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                      onClick={() => setArticleAngle(angle.toLowerCase())}
                    >
                      {angle}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              className='w-full  mt-4'
              variant='secondary'
              onClick={handleGenerateArticle}
              disabled={
                !keyPoints ||
                !articleLength ||
                !articleTone ||
                !articleAngle ||
                isGenerating
              }
            >
              {isGenerating ? 'Generating...' : 'Generate Article'}
            </Button>
          </div>
        </main>
      </div>
    </>
  )
}
