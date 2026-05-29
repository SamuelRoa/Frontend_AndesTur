import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { Sidebar } from "@/components/sidebar";
import { Dashboard } from "@/components/dashboard";
import { EmployeesModule } from "@/components/modules/employees-module";
import { DestinationsModule } from "@/components/modules/destinations-module";
import { PackagesModule } from "@/components/modules/packages-module";
import { VehiclesModule } from "@/components/modules/vehicles-module";
import { ReservationsModule } from "@/components/modules/reservations-module";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";

export default function App() {
  const { user, login, register, logout } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mode, setMode] = useState("login");
  const [activeModule, setActiveModule] = useState("dashboard");
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
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "employees":
        return <EmployeesModule />;
      case "destinations":
        return <DestinationsModule />;
      case "packages":
        return <PackagesModule />;
      case "vehicles":
        return <VehiclesModule />;
      case "reservations":
        return <ReservationsModule />;
      default:
        return <Dashboard />;
    }
  };

  const currentTheme = mounted ? resolvedTheme || theme || "light" : "light";

  const authBackground =
    currentTheme === "dark"
      ? "linear-gradient(rgba(3, 7, 18, 0.66), rgba(3, 7, 18, 0.86)), url(/Laguna_de_Mucubaj%C3%AD,_Merida,_Venezuela.jpg)"
      : "linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.45)), url(/Laguna_de_Mucubaj%C3%AD,_Merida,_Venezuela.jpg)";

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative bg-background"
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
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onLogout={logout}
        userEmail={user?.email}
      />
      <main className="lg:ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground capitalize">
            {activeModule === "dashboard" ? "Dashboard" : activeModule}
          </p>
          <ThemeToggle />
        </div>
        {renderModule()}
      </main>
    </div>
  );
}
