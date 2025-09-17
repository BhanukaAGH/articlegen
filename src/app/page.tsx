import Link from 'next/link'

const HomePage = () => {
  return (
    <div className='min-h-screen'>
      <nav className='flex items-center justify-between px-6 py-3'>
        <h1 className='text-2xl font-bold'>ArticleGen</h1>
        <div className='space-x-4 flex items-center'>
          <Link href='/sign-in' className='text-gray-600 hover:text-gray-800'>
            Login
          </Link>
          <Link
            href='/sign-up'
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </div>
  )
}

export default HomePage
