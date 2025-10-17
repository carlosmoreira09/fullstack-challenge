import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BellRing,
  Cable,
  Database,
  LayoutDashboard,
  Lock,
  Server,
} from 'lucide-react'

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

const microservices: Microservice[] = [
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
    healthUrl: 'http://localhost:3001',
  },
  {
    id: 'auth-service',
    name: 'Auth Service',
    description: 'Handles authentication and token management.',
    port: '3002',
    container: 'auth-service',
    protocol: 'tcp',
    icon: Lock,
    healthUrl: 'http://localhost:3002',
  },
  {
    id: 'tasks-service',
    name: 'Tasks Service',
    description: 'Processes task domain logic and persistence.',
    port: '3003',
    container: 'tasks-service',
    protocol: 'tcp',
    icon: Activity,
    healthUrl: 'http://localhost:3003',
  },
  {
    id: 'notifications-service',
    name: 'Notifications Service',
    description: 'Publishes real-time notifications and WebSocket events.',
    port: '3004',
    container: 'notifications-service',
    protocol: 'tcp/ws',
    icon: BellRing,
    healthUrl: 'http://localhost:3004',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Primary data store for services.',
    port: '5432',
    container: 'db',
    protocol: 'postgres',
    icon: Database,
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
  },
]

export const Route = createFileRoute('/')({
  component: MicroservicesDashboard,
})

type ServiceState = 'loading' | 'online' | 'degraded' | 'offline' | 'not-monitored'

type ServiceStatus = {
  state: ServiceState
  httpStatus?: number
  message?: string
}

function MicroservicesDashboard() {
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
      await Promise.all(
        services
          .filter((service) => service.healthUrl)
          .map(async (service) => {
            try {
              const response = await fetch(service.healthUrl!, {
                method: 'GET',
                headers: {
                  Accept: 'application/json, text/plain, */*',
                },
                cache: 'no-store',
                mode: 'cors',
              })
                console.log(response)

              if (cancelled) return

              setStatuses((prev) => ({
                ...prev,
                [service.id]: {
                  state: response.ok ? 'online' : 'degraded',
                  httpStatus: response.status,
                  message: response.statusText || undefined,
                },
              }))
            } catch (error) {
              if (cancelled) return

              setStatuses((prev) => ({
                ...prev,
                [service.id]: {
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
    }

    checkHealth()
    const interval = window.setInterval(checkHealth, 15000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [services])

  const renderStatusBadge = (status: ServiceStatus) => {
    switch (status.state) {
      case 'online':
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
            Online
            {status.httpStatus ? ` · ${status.httpStatus}` : null}
          </span>
        )
      case 'degraded':
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.7)]" />
            Degraded
            {status.httpStatus ? ` · ${status.httpStatus}` : null}
          </span>
        )
      case 'offline':
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
            Offline
          </span>
        )
      case 'loading':
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
            Checking...
          </span>
        )
      case 'not-monitored':
      default:
        return (
          <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-500/60" />
            Not monitored
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16 text-slate-100">
        <header className="flex flex-col items-start gap-4">
          <span className="rounded-full bg-slate-900/80 px-4 py-1 text-sm font-medium text-slate-300 ring-1 ring-slate-800">
            TaskManager Jungle • Microservices
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Runtime overview
          </h1>
          <p className="max-w-3xl text-base text-slate-300">
            A quick snapshot of every service that powers the TaskManager Jungle
            platform. Use these details to verify that each container is up and
            listening on the expected port while you develop locally.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon
            const status = statuses[service.id]
            return (
              <article
                key={service.name}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/40 transition hover:border-cyan-500/60 hover:shadow-cyan-500/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-slate-900 p-3">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold">{service.name}</h2>
                      <p className="text-sm text-slate-400">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(status)}
                </div>

                <dl className="mt-6 grid gap-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">Container</dt>
                    <dd className="font-mono text-slate-200">{service.container}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">Protocol</dt>
                    <dd className="font-mono text-slate-200">{service.protocol}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">Port</dt>
                    <dd className="font-mono text-slate-200">{service.port}</dd>
                  </div>
                </dl>

                {service.url ? (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Open interface
                  </a>
                ) : status.state === 'not-monitored' ? (
                  <p className="mt-6 text-sm text-slate-500">
                    Monitoring not available for this protocol.
                  </p>
                ) : status.message ? (
                  <p className="mt-6 text-sm text-slate-500">
                    {status.message}
                  </p>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">
                    No additional details.
                  </p>
                )}
              </article>
            )
          })}
        </section>

        <footer className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">
          Update these details if you change container names, ports, or expose
          new services in `docker-compose.yaml`.
        </footer>
      </div>
    </div>
  )
}
