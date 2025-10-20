import {Outlet, createRootRoute, createRouter, createRoute} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from "@/components/ui/sonner"
import  Login  from "@/pages/login/Login"
import { Home } from "@/pages/Home"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import {MicroservicesDashboard} from "@/pages/system/SystemInfo.tsx";
import CreateUserPage from "@/pages/users/CreateUserPage.tsx";
import UsersPage from "@/pages/users/UsersPage.tsx";
import ListTasks from "@/pages/tasks/ListTasks.tsx";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
        <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: ProtectedRoute,
})

const homeRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: Home,
})
const systemStatusRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/system',
    component: MicroservicesDashboard,
})
const usersRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/usuarios',
    component: UsersPage,
})

const tasksRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/tarefas',
    component: ListTasks,
})
const addUserRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/adicionar-usuario',
    component: CreateUserPage,
})


const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
      homeRoute,
      systemStatusRoute,
      usersRoute.addChildren(
          [addUserRoute]
      ),
      tasksRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const Route = rootRoute
