import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as TanStackQueryProvider from '../tanstack-query/queryclient.tsx'
import { Toaster } from '@/components/ui/sonner'
import Login from '@/pages/login/Login'
import { authenticatedRoute } from '@/components/ProtectedRoute'
import { systemStatusRoute } from '@/pages/system/SystemInfo.tsx'
import { usersRoute } from '@/pages/users/UsersPage.tsx'
import { tasksRoute } from '@/pages/tasks/ListTasks.tsx'
import { taskDetailsRoute } from '@/pages/tasks/TaskDetails.tsx'
import { homeRoute } from '@/pages/Home.tsx'

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
})

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

export const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    homeRoute,
    systemStatusRoute,
    usersRoute,
    tasksRoute.addChildren([taskDetailsRoute]),
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  context: {
    ...TanStackQueryProviderContext,
    auth: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const Route = rootRoute
