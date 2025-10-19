import { Outlet, createRootRoute, createRouter, createRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Toaster } from "@/components/ui/sonner"
import { Login } from "@/pages/login/Login"
import { Home } from "@/pages/Home"
import { ProtectedRoute } from "@/components/ProtectedRoute"

// Rota raiz
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
      <TanStackDevtools
          config={{
              position: 'bottom-right',
          }}
          plugins={[
              {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtools />,
              },
          ]}
           />
    </>
  ),
})

// Rota de login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

// Rota protegida (wrapper para rotas que precisam de autenticação)
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: ProtectedRoute,
})

// Rota da home (protegida)
const homeRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: Home,
})

// Configuração das rotas
const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    homeRoute,
    // Adicione mais rotas protegidas aqui
  ]),
])

// Criação do roteador
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!, // Isso será preenchido no AuthProvider
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const Route = rootRoute
