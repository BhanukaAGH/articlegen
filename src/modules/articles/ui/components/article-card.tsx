import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MoreVertical } from 'lucide-react'

export const ArticleCard = () => {
  return (
    <Card className='bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer group relative'>
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
        <h3 className='text-base font-medium text-white mb-2'>
          Untitled article
        </h3>
        <p className='text-xs text-slate-400 mt-auto'>
          Sep 17, 2025 • 0 sources
        </p>
      </div>
    </Card>
  )
}
