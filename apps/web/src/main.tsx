import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import  AuthProvider  from './context/AuthContext'
import { router } from './routes/__root'
import * as TanStackQueryProvider from './tanstack-query/queryclient.tsx'

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <AuthProvider>
          <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
          <RouterProvider router={router} />
          </TanStackQueryProvider.Provider>
      </AuthProvider>
    </StrictMode>,
  )
}

reportWebVitals()
