import React, {useEffect} from "react";
import {Outlet, useLocation} from "react-router-dom";
import {Toaster} from "sonner";
import {useAuth} from "@/hooks/auth.tsx";
import Cookies from "js-cookie";
import {ITokenPayload} from "@/types/auth.ts";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router";
import {DashboardHeader} from "@/components/dashboard/dashboard-header.tsx";
import {Header} from "@/components/Header.tsx";
import {SystemVersionFooter} from "@/components/SystemVersionFooter.tsx";

const AppLayout: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleHeader = () => {
        if(auth.role === 'franquia' && auth.isAuthenticated) {
            return <Header />
        }
        if(auth.role === 'owner' || auth.role === 'master_admin') {
            return (
                <div className="flex w-full flex-col bg-background text-primary">
                    <DashboardHeader />
                </div>
            )
        }
        return <></>
    }

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = Cookies.get('token');
                if (token) {
                    const decoded: ITokenPayload = jwtDecode(token);
                    const currentPath = location.pathname;
                    if (( decoded.role === 'master_admin' || decoded.role === 'owner') && !currentPath.includes('/admin/')) {
                        return navigate('/admin/dashboard');
                    } else if (decoded.role === 'franquia' && !currentPath.includes('/franchise/')) {
                        return navigate('/franchise/dashboard');
                    } else if (!decoded.role) {
                        auth.logOut();
                        return navigate(currentPath.includes('/admin/') ? '/admin' : '/franchise');
                    }
                }
            } catch (error) {
                auth.logOut();
                return navigate(location.pathname.includes('/admin/') ? '/admin' : '/franchise');
            }
        };

        checkToken().then();
    }, [auth, navigate, location]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div>
                {handleHeader()}
            </div>
            <main className="p-10 flex-1">
                <Outlet/>
                <Toaster/>
            </main>
            <footer className="border-t py-4 px-6 bg-background">
                <SystemVersionFooter />
            </footer>
        </div>
    );
}

export default AppLayout;