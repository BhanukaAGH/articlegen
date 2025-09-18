import Image from 'next/image'
import { Clipboard, File } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PublicFile } from 'convex/files'

interface SourcesListProps {
  sources: PublicFile[]
  status: 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted'
  loadMore: (numItems: number) => void
}

export const SourcesList = ({
  sources,
  status,
  loadMore,
}: SourcesListProps) => {
  if (status === 'LoadingFirstPage') {
    return (
      <p className='text-slate-400 text-sm text-center mt-4'>
        Loading sources…
      </p>
    )
  }

  if (!sources.length) {
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
        {sources.map((file) => (
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
