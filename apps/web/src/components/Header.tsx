import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, Users, ListTodo } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { Button } from '@/components/ui/button'
import {
    NavigationMenu, NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList, NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

export default function Header() {
  const { logout, decoded } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-semibold">
          <Link to="/" className="hover:text-gray-300 transition-colors">
            TaskManagerJungle
          </Link>
        </h1>
        
        <NavigationMenu>
          <NavigationMenuList className="flex-wrap">
            <NavigationMenuItem>
                 <NavigationMenuTrigger className={navigationMenuTriggerStyle() + " bg-transparent text-white hover:bg-gray-800 hover:text-black"}>
                     <Users size={18} className="mr-2" />
                     Usuários
                 </NavigationMenuTrigger>
                    <NavigationMenuContent className="grid gap-4 p-2 pb-5 bg-gray-700 text-white space-y-2">
                        <NavigationMenuLink asChild>
                            <Link to="/adicionar-usuario" className="w-[200px] hover:bg-gray-800 hover:text-white p-2 rounded-2xl block">
                                Adicionar Usuário
                            </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                            <Link to="/usuarios" className="hover:bg-gray-800 hover:text-white p-2 rounded-2xl block">
                                Lista de Usuários
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle() + " bg-transparent text-white hover:bg-gray-700 hover:text-white"}>
                <Link to="/tarefas">
                  <ListTodo size={18} className="mr-2" />
                  Tarefas
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle() + " bg-transparent text-white hover:bg-gray-700 hover:text-white"}>
                <Link to="/system">
                  <ListTodo size={18} className="mr-2" />
                  Status do Sistema
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      <div className="flex items-center gap-4">
        {decoded && (
          <span className="text-sm text-gray-300">
            {decoded.email}
          </span>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-700"
        >
          <LogOut size={18} className="mr-2" />
          Sair
        </Button>
      </div>
    </header>
  )
}
