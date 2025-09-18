'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import { useAction, usePaginatedQuery, useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
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
  const extractKeyPointsAction = useAction(api.chat.extractKeyPoints)

  const handleExtractKeyPoints = async () => {
    setIsExtracting(true)
    try {
      const points = await extractKeyPointsAction({
        articleId: articleId as Id<'articles'>,
      })
      console.log(points)

      setKeyPoints(points)
    } catch (error) {
      console.error('Failed to extract key points', error)
    } finally {
      setIsExtracting(false)
    }
  }

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
        <main className='px-6 py-3 flex gap-4 h-[calc(100vh-64px)]'>
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
          <div className='flex-1 bg-slate-900 border border-slate-800 rounded-lg p-4'>
            {keyPoints ? (
              <div>
                <h2 className='text-xl font-semibold mb-4'>Key Points</h2>
                <div className='text-slate-300 whitespace-pre-wrap'>
                  {keyPoints}
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

            <div className='flex flex-col flex-1'>{/* settings option */}</div>

            <Button
              className='w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 mt-4'
              onClick={() => {}}
            >
              Generate Article
            </Button>
          </div>
        </main>
      </div>
    </>
  )
}
