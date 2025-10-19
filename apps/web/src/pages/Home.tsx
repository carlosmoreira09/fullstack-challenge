import { useAuth } from '@/hooks/auth'

export function Home() {
  const { decoded } = useAuth()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bem-vindo ao TaskManagerJungle
        </h1>
        <div className="space-y-4">
          <p className="text-gray-600">
            Você está logado com sucesso!
          </p>
          {decoded && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Email:</span> {decoded.email}</p>
                <p><span className="font-medium">User ID:</span> {decoded.userId}</p>
                <p><span className="font-medium">Role:</span> {decoded.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home