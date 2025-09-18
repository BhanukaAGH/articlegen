export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-950 text-white'>
      {children}
    </div>
  )
}
