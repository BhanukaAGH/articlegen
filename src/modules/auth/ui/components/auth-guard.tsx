'use client'

import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'

import { SignInView } from '../views/sign-in-view'
import { AuthLayout } from '../layouts/auth-layout'
import { Loading } from '@/components/loading'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthLoading>
        <AuthLayout>
          <Loading />
        </AuthLayout>
      </AuthLoading>

      <Authenticated>{children}</Authenticated>

      <Unauthenticated>
        <AuthLayout>
          <SignInView />
        </AuthLayout>
      </Unauthenticated>
    </>
  )
}
