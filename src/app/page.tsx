import Link from 'next/link'

const HomePage = () => {
  return (
    <div className='min-h-screen w-full bg-[#fefcff] relative flex flex-col'>
      {/* Dreamy Sky Pink Glow */}
      <div
        className='absolute inset-0 z-0'
        style={{
          backgroundImage: `
        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      />

      <nav className='flex items-center justify-between px-4 sm:px-8 py-4 z-10'>
        <div className='flex items-center gap-3'>
          <Link href='/'>
            <div className='size-6 bg-slate-950 rounded flex items-center justify-center'>
              <div className='w-3 h-3 bg-white rounded' />
            </div>
          </Link>
          <h1 className='text-2xl font-bold'>ArticleGen</h1>
        </div>
        <div className='space-x-3 flex items-center'>
          <Link
            href='/sign-in'
            className='px-6 py-2 rounded-full text-gray-600 hover:text-gray-800 transition-colors'
          >
            Login
          </Link>
          <Link
            href='/sign-up'
            className='bg-black text-white px-6 py-2 rounded-full hover:bg-gray-900 transition-colors'
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className='flex-1 flex flex-col items-center justify-center px-4 sm:px-6 max-w-7xl mx-auto w-full z-10'>
        <div className='text-center -mt-20 md:-mt-12'>
          <h1 className='text-3xl md:text-5xl lg:text-6xl 2xl:text-7xl font-semibold leading-tight'>
            Transform Transcripts into
            <br />
            <span className='bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent'>
              Compelling Articles
            </span>
          </h1>
          <p className='mt-6 text-md sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto'>
            ArticleGen streamlines your workflow by turning supporting sources
            into story-driven draft articles. Automatically extract key points,
            set the tone, and generate a draft complete with source mapping and
            a quote checker.
          </p>
          <Link
            href='/articles'
            className='mt-10 inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-900 transition-colors'
          >
            Try ArticleGen
          </Link>
        </div>
      </main>
    </div>
  )
}

export default HomePage
