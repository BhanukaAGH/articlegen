'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { Clipboard, File, Plus } from 'lucide-react'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ArticleTitleForm } from '../components/article-title-form'
import { SourceUploadDialog } from '../components/source-upload-dialog'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import Image from 'next/image'

export const ArticleIdView = () => {
  const { articleId } = useParams()
  const article = useQuery(api.articles.getOne, {
    id: articleId as Id<'articles'>,
  })
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false)

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
            <SourcesList articleId={articleId as Id<'articles'>} />
          </div>

          {/* Chat Panel */}
          <div className='flex-1 bg-slate-900 border border-slate-800 rounded-lg p-4'>
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

function SourcesList({ articleId }: { articleId: Id<'articles'> }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.files.list,
    { articleId },
    { initialNumItems: 10 }
  )

  if (status === 'LoadingFirstPage') {
    return (
      <p className='text-slate-400 text-sm text-center mt-4'>
        Loading sources…
      </p>
    )
  }

  if (!results.length) {
    return (
      <>
        <p className='text-slate-400 text-sm text-center mt-20'>
          Saved sources will appear here
        </p>
        <p className='text-slate-500 text-xs text-center mt-2'>
          Click Add source above to add PDFs, websites, text, videos or audio
          files.
        </p>
      </>
    )
  }

  return (
    <div className='space-y-2'>
      <div className='space-y-2'>
        {results.map((file) => (
          <div
            key={file.id}
            className='flex items-center gap-3 rounded border border-slate-800 bg-slate-800/40 px-3 py-2'
          >
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                {file.type.includes('pdf') ? (
                  <Image
                    alt='pdf icon'
                    src={'/pdf.png'}
                    width={20}
                    height={20}
                  />
                ) : file.type.includes('text') ? (
                  <Clipboard className='size-5 text-slate-200' />
                ) : (
                  <File className='size-5 text-slate-200' />
                )}
                <p className='truncate text-sm text-slate-200'>{file.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {status !== 'Exhausted' && (
        <Button
          variant='outline'
          size='sm'
          className='w-full border-slate-700 text-slate-200'
          onClick={() => loadMore(10)}
        >
          Load more
        </Button>
      )}
    </div>
  )
}
