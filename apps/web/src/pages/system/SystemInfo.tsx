import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BellRing,
  Cable,
  Database,
  LayoutDashboard,
  Lock,
  Server,
} from 'lucide-react'
import { createRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { authenticatedRoute } from '@/components/ProtectedRoute.tsx'

type Microservice = {
  id: string
  name: string
  description: string
  port: string
  container: string
  protocol: string
  icon: LucideIcon
  url?: string
  healthUrl?: string
}

const microservices: Array<Microservice> = [
  {
    id: 'web',
    name: 'Web Client',
    description: 'Frontend interface served via Vite dev server.',
    port: '3000',
    container: 'web',
    protocol: 'http',
    icon: LayoutDashboard,
    url: 'http://localhost:3000',
    healthUrl: '__SELF__',
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    description: 'Central API gateway exposing REST endpoints.',
    port: '3001',
    container: 'api-gateway',
    protocol: 'http',
    icon: Server,
    url: 'http://localhost:3001',
    healthUrl: 'http://localhost:3001/api/health',
  },
  {
    id: 'auth-service',
    name: 'Auth Service',
    description: 'Handles authentication and token management.',
    port: '3002',
    container: 'auth-service',
    protocol: 'tcp',
    icon: Lock,
    healthUrl: 'http://localhost:3001/api/health/auth',
  },
  {
    id: 'tasks-service',
    name: 'Tasks Service',
    description: 'Processes task domain logic and persistence.',
    port: '3004',
    container: 'tasks-service',
    protocol: 'tcp',
    icon: Activity,
    healthUrl: 'http://localhost:3001/api/health/tasks',
  },
  {
    id: 'notifications-service',
    name: 'Notifications Service',
    description: 'Publishes real-time notifications and WebSocket events.',
    port: '3003',
    container: 'notifications-service',
    protocol: 'tcp/ws',
    icon: BellRing,
    healthUrl: 'http://localhost:3001/api/health/notifications',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Primary data store for services.',
    port: '5432',
    container: 'db',
    protocol: 'postgres',
    icon: Database,
    healthUrl: 'http://localhost:3001/api/health/postgres',
  },
  {
    id: 'rabbitmq',
    name: 'RabbitMQ',
    description: 'Message broker for service communication.',
    port: '5672',
    container: 'rabbitmq',
    protocol: 'amqp',
    icon: Cable,
    url: 'http://localhost:15672',
    healthUrl: 'http://localhost:3001/api/health/rabbitmq',
  },
]

type ServiceState =
  | 'loading'
  | 'online'
  | 'degraded'
  | 'offline'
  | 'not-monitored'

type ServiceStatus = {
  state: ServiceState
  httpStatus?: number
  message?: string
}

export const systemStatusRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/system',
  component: MicroservicesDashboard,
})

export function MicroservicesDashboard() {
  const services = useMemo(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'http://localhost:3000'

    return microservices.map((service) =>
      service.healthUrl === '__SELF__'
        ? { ...service, healthUrl: origin }
        : service,
    )
  }, [])

  const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>(() =>
    services.reduce<Record<string, ServiceStatus>>((acc, service) => {
      acc[service.id] = {
        state: service.healthUrl ? 'loading' : 'not-monitored',
      }
      return acc
    }, {}),
  )

  useEffect(() => {
    let cancelled = false

    const checkHealth = async () => {
      try {
        if (!cancelled) {
          setStatuses((prev) => ({
            ...prev,
            web: {
              state: 'online',
              httpStatus: 200,
              message: 'Web client is running',
            },
          }))
        }

        try {
          const apiGatewayResponse = await fetch(
            'http://localhost:3001/api/health',
            {
              method: 'GET',
              cache: 'no-store',
              mode: 'cors',
            },
          )
          if (!cancelled) {
            setStatuses((prev) => ({
              ...prev,
              'api-gateway': {
                state: apiGatewayResponse.ok ? 'online' : 'degraded',
                httpStatus: apiGatewayResponse.status,
              },
            }))
          }
        } catch (error) {
          if (!cancelled) {
            setStatuses((prev) => ({
              ...prev,
              'api-gateway': {
                state: 'offline',
                message: 'API Gateway unavailable',
              },
            }))
          }
        }

        const serviceChecks = [
          { id: 'api-gateway', endpoint: 'http://localhost:3001/api/health' },
          {
            id: 'auth-service',
            endpoint: 'http://localhost:3001/api/health/auth',
          },
          {
            id: 'tasks-service',
            endpoint: 'http://localhost:3001/api/health/tasks',
          },
          {
            id: 'notifications-service',
            endpoint: 'http://localhost:3001/api/health/notifications',
          },
          {
            id: 'postgres',
            endpoint: 'http://localhost:3001/api/health/postgres',
          },
          {
            id: 'rabbitmq',
            endpoint: 'http://localhost:3001/api/health/rabbitmq',
          },
        ]

        await Promise.all(
          serviceChecks.map(async ({ id, endpoint }) => {
            try {
              const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                },
                cache: 'no-store',
                mode: 'cors',
              })

              if (cancelled) return

              if (response.ok) {
                const data = await response.json()
                setStatuses((prev) => ({
                  ...prev,
                  [id]: {
                    state: response.ok ? 'online' : 'offline',
                    httpStatus: response.status,
                    message: data.message,
                  },
                }))
              } else {
                setStatuses((prev) => ({
                  ...prev,
                  [id]: {
                    state: 'degraded',
                    httpStatus: response.status,
                  },
                }))
              }
            } catch (error) {
              if (cancelled) return

              setStatuses((prev) => ({
                ...prev,
                [id]: {
                  state: 'offline',
                  message:
                    error instanceof Error
                      ? error.message
                      : 'Unable to reach service',
                },
              }))
            }
          }),
        )
      } catch (error) {
        console.error('Health check error:', error)
      }
    }

    checkHealth()
    const interval = window.setInterval(checkHealth, 1500000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [services])

  const renderStatusBadge = (status: ServiceStatus) => {
    switch (status.state) {
      case 'online':
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Online
            {status.httpStatus ? ` · ${status.httpStatus}` : null}
          </span>
        )
      case 'degraded':
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-amber-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            404
            {status.httpStatus ? ` · ${status.httpStatus}` : null}
          </span>
        )
      case 'offline':
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-rose-600">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Offline
          </span>
        )
      case 'loading':
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
            Checking...
          </span>
        )
      case 'not-monitored':
      default:
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted" />
            Not monitored
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <header className="mb-8 flex flex-col items-start gap-4">
          <span className="rounded-full bg-muted px-4 py-1 text-sm font-medium text-muted-foreground ring-1 ring-border">
            TaskManager Jungle • Microservices Running
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Visão geral
          </h1>
          <p className="text-base text-muted-foreground">
            Um rápido resumo de todos os serviços que alimentam a plataforma
            TaskManager Jungle. Use esses detalhes para verificar se cada
            contêiner está ativo e escutando na porta esperada enquanto você
            desenvolve localmente.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon
            const status = statuses[service.id]
            return (
              <article
                key={service.name}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-muted p-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {service.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(status)}
                </div>

                <dl className="mt-6 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Container</dt>
                    <dd className="font-mono text-foreground">
                      {service.container}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Protocol</dt>
                    <dd className="font-mono text-foreground">
                      {service.protocol}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Port</dt>
                    <dd className="font-mono text-foreground">
                      {service.port}
                    </dd>
                  </div>
                </dl>

                {service.url ? (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Open interface
                  </a>
                ) : status.state === 'not-monitored' ? (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Monitoring not available for this protocol.
                  </p>
                ) : status.message ? (
                  <p className="mt-6 text-sm text-muted-foreground">
                    {status.message}
                  </p>
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground">
                    No additional details.
                  </p>
                )}
              </article>
            )
          })}
        </section>

        <footer className="mt-8 rounded-2xl border border-border bg-muted/50 p-6 text-sm text-muted-foreground">
          Update these details if you change container names, ports, or expose
          new services in `docker-compose.yaml`.
        </footer>
      </div>
    </div>
  )
}
