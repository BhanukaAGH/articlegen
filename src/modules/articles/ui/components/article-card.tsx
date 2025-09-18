import { useRouter } from 'next/navigation'
import { MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Doc } from 'convex/_generated/dataModel'

interface ArticleCardProps {
  article: Doc<'articles'>
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const router = useRouter()

  return (
    <Card
      className='bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer group relative'
      onClick={() => router.push(`/articles/${article._id}`)}
    >
      <div className='absolute top-3 right-3'>
        <Button
          variant='ghost'
          size='sm'
          className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 h-6 w-6'
        >
          <MoreVertical className='w-3 h-3 text-slate-400' />
        </Button>
      </div>
      <div className='p-6 h-40 flex flex-col'>
        <div className='w-8 h-8 mb-4'>
          <div className='w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-sm flex items-center justify-center'>
            <div className='w-4 h-4 bg-white/20 rounded-sm'></div>
          </div>
        </div>
        <h3 className='text-base font-medium text-white mb-2 truncate'>
          {article.title}
        </h3>
        <p className='text-xs text-slate-400 mt-auto'>
          {new Date(article._creationTime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          • 0 sources
        </p>
      </div>
    </Card>
  )
}

export const ArticleCardSkeleton = () => {
  return (
    <Card className='bg-slate-900 border-slate-800 h-full'>
      <div className='p-6 h-full flex flex-col'>
        <Skeleton className='w-8 h-8 mb-4 bg-slate-700' />
        <Skeleton className='w-3/4 h-5 mb-2 bg-slate-700' />
        <Skeleton className='w-1/2 h-3 mt-auto bg-slate-700' />
      </div>
    </Card>
  )
}
