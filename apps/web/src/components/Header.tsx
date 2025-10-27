import { Link, useNavigate } from '@tanstack/react-router'
import { ListTodo, LogOut, Users } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import NotificationMenu from '@/components/notification-menu.tsx'

export default function Header() {
  const { logout, decoded, userId } = useAuth()
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
              <NavigationMenuLink asChild>
                <Link
                  to="/usuarios"
                  className="flex hover:bg-gray-800 hover:text-white p-2 rounded-2xl block"
                >
                  <Users size={18} className="mr-2" /> Usuários
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={
                  navigationMenuTriggerStyle() +
                  ' bg-transparent text-white hover:bg-gray-700 hover:text-white'
                }
              >
                <Link to="/tarefas">
                  <ListTodo size={18} className="mr-2" />
                  Tarefas
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={
                  navigationMenuTriggerStyle() +
                  ' bg-transparent text-white hover:bg-gray-700 hover:text-white'
                }
              >
                <Link to="/system">
                  <ListTodo size={18} className="mr-2" />
                  Status do Sistema
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div></div>
      <NotificationMenu userId={userId} />
      <div className="flex items-center gap-4">
        {decoded && (
          <span className="text-sm text-gray-300">{decoded.email}</span>
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
