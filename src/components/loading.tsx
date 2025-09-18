import { Loader2 } from 'lucide-react'

export const Loading = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-950 text-white'>
      <Loader2 className='size-10 animate-spin text-blue-500' />
    </div>
  )
}
