import { useEffect, useState } from "react";
import { cn } from '@/lib/utils'
import { useTheme } from "next-themes";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { Sidebar } from "@/components/sidebar";
import { Dashboard } from "@/components/dashboard";
import { DashboardOperador } from "@/components/dashboard-operator";
import { EmployeesModule } from "@/components/modules/employees-module";
import { DestinationsModule } from "@/components/modules/destinations-module";
import { PackagesModule } from "@/components/modules/packages-module";
import { VehiclesModule } from "@/components/modules/vehicles-module";
import { ReservationsModule } from "@/components/modules/reservations-module";
import { UsersModule } from "@/components/modules/users-module";
import { TrashModule } from "@/components/modules/trash-module";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/global-search";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { useAuth } from "@/lib/auth";
import { ProfileDialog } from "@/components/profile-dialog";

export default function App() {
  const { user, loading, login, register, logout, updateUser } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mode, setMode] = useState("login");
  const [activeModule, setActiveModule] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (email, password) => {
    await login(email, password);
  };

  const handleSignup = async (formData) => {
    await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
  };

  const renderModule = () => {
    const isAdmin = user?.role === 'admin' || user?.role === 1 || user?.permissions?.includes('*')
    switch (activeModule) {
      case "dashboard":
        return isAdmin
          ? <Dashboard onNavigate={setActiveModule} userName={user?.username} />
          : <DashboardOperador onNavigate={setActiveModule} userName={user?.username} />;
      case "employees":
        return <EmployeesModule onNavigate={setActiveModule} />;
      case "destinations":
        return <DestinationsModule />;
      case "packages":
        return <PackagesModule />;
      case "vehicles":
        return <VehiclesModule />;
      case "reservations":
        return <ReservationsModule />;
      case "users":
        return <UsersModule />;
      case "trash":
        return <TrashModule />;
      default:
        return isAdmin
          ? <Dashboard onNavigate={setActiveModule} userName={user?.username} />
          : <DashboardOperador onNavigate={setActiveModule} userName={user?.username} />;
    }
  };

  const currentTheme = mounted ? resolvedTheme || theme || "light" : "light";

  const authBackground =
    currentTheme === "dark"
      ? "linear-gradient(rgba(3, 7, 18, 0.66), rgba(3, 7, 18, 0.86)), url(/Laguna_de_Mucubaj%C3%AD,_Merida,_Venezuela.jpg)"
      : "linear-gradient(rgba(248, 244, 235, 0.55), rgba(248, 244, 235, 0.85)), url(/Laguna_de_Mucubaj%C3%AD,_Merida,_Venezuela.jpg)";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative bg-background auth-vignette"
        style={{
          backgroundImage: authBackground,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {mode === "login" ? (
          <LoginForm onSuccess={handleLogin} />
        ) : (
          <SignupForm onSuccess={handleSignup} />
        )}
        <div className="fixed bottom-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-primary hover:underline font-medium"
              >
                Registrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onLogout={logout}
        userEmail={user?.email}
        userName={user?.username}
        userRole={user?.role}
        userPermissions={user?.permissions}
        userAvatar={user?.avatar}
        onProfileUpdate={(data) => updateUser(data)}
        onProfileOpen={() => setProfileOpen(true)}
      />
      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={{ username: user?.username, email: user?.email, avatar: user?.avatar }}
        onSave={(data) => { setProfileOpen(false); updateUser(data) }}
      />
      <main className="lg:ml-64 p-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <GlobalSearch onNavigate={setActiveModule} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity"
            >
              <Avatar className="size-7 ring-2 ring-border/50">
                {user?.avatar ? <AvatarImage src={user.avatar} /> : null}
                <AvatarFallback className="text-xs">
                  <User className="size-3.5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground hidden sm:inline">{user?.username}</span>
            </button>
          </div>
        </div>
        <ModuleWrapper moduleKey={activeModule}>{renderModule()}</ModuleWrapper>
      </main>
    </div>
  );
}

function ModuleWrapper({ children, moduleKey }) {
  const [mountedModule, setMountedModule] = useState(false)

  useEffect(() => {
    setMountedModule(false)
    const t = setTimeout(() => setMountedModule(true), 10)
    return () => clearTimeout(t)
  }, [moduleKey])

  return (
    <div className={cn('transform-gpu transition-all duration-300 ease-out', mountedModule ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1')}>
      {children}
    </div>
  )
}
