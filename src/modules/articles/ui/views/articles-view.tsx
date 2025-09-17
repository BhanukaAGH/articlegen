'use client'

import { UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ChevronDown, Grid3X3, List, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArticleCard } from '../components/article-card'

export const ArticlesView = () => {
  const router = useRouter()

  const handleCreateNew = () => {
    router.push('/articles/new')
  }

  return (
    <div className='min-h-screen bg-slate-950 text-white'>
      {/* Header */}
      <header className='flex items-center justify-between px-6 py-3 sticky top-0'>
        <div className=' flex items-center gap-3'>
          <div className='w-6 h-6 bg-white rounded flex items-center justify-center'>
            <div className='w-3 h-3 bg-slate-950 rounded'></div>
          </div>
          <h1 className='text-xl font-medium'>ArticleGen</h1>
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
      <main className='px-6 py-6 max-w-10/12 mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-medium'>My articles</h2>

          <div className='flex items-center gap-3'>
            {/* View Toggle */}
            <div className='flex items-center bg-slate-800 rounded-md p-0.5'>
              <Button
                variant='ghost'
                size='sm'
                className='bg-slate-700 text-white hover:bg-slate-600 p-1.5 h-8'
              >
                <Grid3X3 className='w-4 h-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 h-8'
              >
                <List className='w-4 h-4' />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='text-slate-300 hover:text-white hover:bg-slate-800 text-sm'
                >
                  Most recent
                  <ChevronDown className='w-4 h-4 ml-1' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='bg-slate-800 border-slate-700'>
                <DropdownMenuItem className='text-white hover:bg-slate-700'>
                  Most recent
                </DropdownMenuItem>
                <DropdownMenuItem className='text-white hover:bg-slate-700'>
                  Title
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create New Button */}
            <Button
              className='bg-white text-slate-900 hover:bg-slate-100 text-sm'
              onClick={handleCreateNew}
            >
              <Plus className='w-4 h-4 mr-2' />
              Create new
            </Button>
          </div>
        </div>

        {/* Article Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'>
          {/* Create New Article Card */}
          <Card className='bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer group'>
            <div className='p-6 flex flex-col items-center justify-center h-40'>
              <div className='w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-600 transition-colors'>
                <Plus className='w-5 h-5 text-slate-300' />
              </div>
              <h3 className='text-base font-medium text-white'>
                Create new article
              </h3>
            </div>
          </Card>

          <ArticleCard />
          <ArticleCard />
        </div>
      </main>
    </div>
  )
}
