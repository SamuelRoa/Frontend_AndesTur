"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { users as usersApi, auth as authApi, staff as staffApi } from "@/lib/api";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { useAuth } from "@/lib/auth";
import { RolesTab } from "./roles-tab";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  Trash2,
  Lock,
} from "lucide-react";

export function UsersModule() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "operator",
  });

  useEffect(() => {
    const prefill = sessionStorage.getItem("userPrefill");
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        setNewUser({
          username: `${data.name?.toLowerCase() || ""}_${data.last_name?.toLowerCase() || ""}`,
          email: data.email || "",
          password: "",
          role: data.id_staff ? "operator" : "operator",
        });
        setTimeout(() => setIsCreateOpen(true), 100);
      } catch (_) {}
    }
  }, []);

  const PASSWORD_REQUIREMENTS = [
    { label: "Mínimo 8 caracteres", test: (p) => p.length >= 8 },
    { label: "Al menos una mayúscula", test: (p) => /[A-Z]/.test(p) },
    { label: "Al menos una minúscula", test: (p) => /[a-z]/.test(p) },
    { label: "Al menos un número", test: (p) => /\d/.test(p) },
    { label: "Al menos un carácter especial (!@#$%^&*)", test: (p) => /[!@#$%^&*]/.test(p) },
  ];

  const isAdmin = currentUser?.role === "admin";
  const canWrite = isAdmin || currentUser?.role === 1 || currentUser?.permissions?.includes("*") || currentUser?.permissions?.includes("users:write");

  const loadUsers = async (p = 1) => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ page: p });
      setUsers(res.data);
      if (res.pagination) {
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const haystack = `${u.username || ""} ${u.email || ""} ${u.role || ""}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    loadUsers(p);
  };

  const validatePassword = (password) => {
    const failed = PASSWORD_REQUIREMENTS.filter((r) => !r.test(password));
    return failed.map((r) => r.label);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) return;

    const failedReqs = validatePassword(newUser.password);
    if (failedReqs.length > 0) {
      toast.error(`La contraseña debe cumplir: ${failedReqs.join(", ")}`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await usersApi.create({
        username: newUser.username.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role,
      });

      const prefill = sessionStorage.getItem("userPrefill");
      if (prefill) {
        try {
          const data = JSON.parse(prefill);
          if (data.id_staff && res?.data?.id_user) {
            await staffApi.update(data.id_staff, { id_user: res.data.id_user });
            toast.success("Usuario vinculado al empleado correctamente");
          }
        } catch (_) {}
        sessionStorage.removeItem("userPrefill");
      }

      await loadUsers();
      setIsCreateOpen(false);
      setNewUser({ username: "", email: "", password: "", role: "operator" });
      toast.success("Usuario creado correctamente");
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error(err?.message || "Error creando usuario");
    } finally {
      setIsSaving(false);
    }
  };

  const openViewDialog = (u) => {
    setViewingUser(u);
    setIsViewOpen(true);
  };

  const openEditDialog = (u) => {
    setEditingUser({ ...u, password: "" });
    setIsEditOpen(true);
  };

  const handleEditUser = async (event) => {
    event.preventDefault();
    if (!editingUser.username || !editingUser.email) return;
    setIsSaving(true);
    try {
      const payload = {
        username: editingUser.username.trim(),
        email: editingUser.email.trim(),
        role: editingUser.role,
      };
      if (editingUser.password) {
        payload.password = editingUser.password;
      }
      await usersApi.update(editingUser.id_user, payload);
      await loadUsers();
      setIsEditOpen(false);
      setEditingUser(null);
      toast.success("Usuario actualizado correctamente");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err?.message || "Error actualizando usuario");
    } finally {
      setIsSaving(false);
    }
  };

  const handleForcePasswordReset = async () => {
    if (!editingUser) return;
    try {
      await authApi.forgotPassword(editingUser.email);
      setConfirmReset(false);
      toast.success("Correo de recuperación enviado con éxito.");
    } catch (err) {
      console.error("Error forzando reinicio:", err);
      toast.error(err?.message || "Error al forzar reinicio de contraseña");
    }
  };

  const handleToggleActive = async (u) => {
    const nextActive = !Boolean(u.activo);
    try {
      await usersApi.toggleActive(u.id_user, nextActive);
      setUsers((current) =>
        current.map((item) =>
          item.id_user === u.id_user
            ? { ...item, activo: nextActive }
            : item
        )
      );
      toast.success(`Usuario ${nextActive ? "activado" : "desactivado"} correctamente`);
    } catch (err) {
      console.error("Error toggling user active state:", err);
      toast.error(err?.message || "Error actualizando estado del usuario");
    }
  };

  const openDeleteDialog = (u) => {
    setDeleteDialog({ open: true, user: u });
    setDeletePassword("");
    setDeleteError("");
  };

  const handleDeleteUser = async () => {
    if (!deletePassword) {
      setDeleteError("Ingresa tu contraseña para confirmar");
      return;
    }
    setIsDeleting(true);
    setDeleteError("");
    try {
      await usersApi.delete(deleteDialog.user.id_user, deletePassword);
      setUsers((current) => current.filter((item) => item.id_user !== deleteDialog.user.id_user));
      setDeleteDialog({ open: false, user: null });
      setDeletePassword("");
      toast.success(`Usuario "${deleteDialog.user.username}" eliminado correctamente`);
    } catch (err) {
      setDeleteError(err.message || "Error al eliminar usuario");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <ModuleSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Gestión de Seguridad
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios, operadores y permisos del sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:max-w-md">
          {canWrite && (
          <Dialog open={isCreateOpen} onOpenChange={(v) => { setIsCreateOpen(v); if (!v) sessionStorage.removeItem("userPrefill"); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo usuario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-username">Nombre de usuario</Label>
                    <Input
                      id="user-username"
                      value={newUser.username}
                      onChange={(event) =>
                        setNewUser((current) => ({
                          ...current,
                          username: event.target.value,
                        }))
                      }
                      placeholder="ej: operador1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(event) =>
                        setNewUser((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(event) =>
                          setNewUser((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {newUser.password && (
                      <div className="space-y-1 mt-2">
                        {PASSWORD_REQUIREMENTS.map((req) => {
                          const ok = req.test(newUser.password);
                          return (
                            <div key={req.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                              {ok ? "✓" : "○"} {req.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) =>
                        setNewUser((current) => ({ ...current, role: value }))
                      }
                    >
                      <SelectTrigger id="user-role" className="w-full">
                        <SelectValue placeholder="Selecciona el rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Crear usuario"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o rol..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="pl-10 border-border"
        />
      </div>

      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Usuario</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Rol</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">{canWrite ? "Acciones" : "Ver"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id_user} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {u.role === "admin" ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {u.role === "admin" ? "Administrador" : "Operador"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        Boolean(u.activo)
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {Boolean(u.activo) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Ban className="h-3 w-3" />
                      )}
                      {Boolean(u.activo) ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:bg-muted"
                      onClick={() => openViewDialog(u)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canWrite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => openEditDialog(u)}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                    )}
                    {canWrite && u.id_user !== currentUser?.id_user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          Boolean(u.activo)
                            ? "text-destructive hover:bg-destructive/10"
                            : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }
                        onClick={() => handleToggleActive(u)}
                      >
                        {Boolean(u.activo) ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {canWrite && u.id_user !== currentUser?.id_user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => openDeleteDialog(u)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} de {total} usuarios
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="min-w-9" onClick={() => goToPage(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-username">Nombre de usuario</Label>
                  <Input
                    id="edit-user-username"
                    value={editingUser.username}
                    onChange={(event) =>
                      setEditingUser((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-user-email">Email</Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(event) =>
                      setEditingUser((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seguridad</Label>
                  <Button type="button" variant="outline" className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={() => setConfirmReset(true)}>
                    Forzar Reinicio de Contraseña
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-user-role">Rol</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) =>
                      setEditingUser((current) => ({ ...current, role: value }))
                    }
                  >
                    <SelectTrigger id="edit-user-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditingUser(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Información del usuario</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  {viewingUser.role === "admin" ? (
                    <Shield className="h-7 w-7 text-primary" />
                  ) : (
                    <UserCog className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{viewingUser.username}</h3>
                  <p className="text-sm text-muted-foreground">{viewingUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-medium text-foreground">{viewingUser.id_user}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rol</p>
                  <p className="font-medium text-foreground">
                    {viewingUser.role === "admin" ? "Administrador" : "Operador"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      Boolean(viewingUser.activo)
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {Boolean(viewingUser.activo) ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Creado</p>
                  <p className="font-medium text-foreground">{formatDate(viewingUser.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última actualización</p>
                  <p className="font-medium text-foreground">{formatDate(viewingUser.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsViewOpen(false); setViewingUser(null); }}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </TabsContent>
      
      <TabsContent value="roles">
        <RolesTab />
      </TabsContent>
    </Tabs>

      <ConfirmDialog
        open={confirmReset}
        onConfirm={handleForcePasswordReset}
        onCancel={() => setConfirmReset(false)}
        title="Forzar reinicio de contraseña"
        message="¿Estás seguro de que deseas forzar el reinicio de contraseña para este usuario? Se enviará un correo con una contraseña temporal."
        confirmLabel="Enviar correo"
        cancelLabel="Cancelar"
      />

      <Dialog open={deleteDialog.open} onOpenChange={(open) => { setDeleteDialog((prev) => ({ ...prev, open: open })); if (open) { setDeletePassword(""); setDeleteError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Eliminar usuario
            </DialogTitle>
          </DialogHeader>
          {deleteDialog.user && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro de eliminar a <strong>{deleteDialog.user.username}</strong> ({deleteDialog.user.email})?
                Esta acción no se puede revertir.
              </p>
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0" />
                  Ingresa tu contraseña de administrador para confirmar
                </p>
              </div>
              {deleteError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {deleteError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="delete-password">Tu contraseña</Label>
                <Input
                  id="delete-password"
                  type="password"
                  placeholder="••••••••"
                  value={deletePassword}
                  onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
                  className="border-border"
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialog({ open: false, user: null }); setDeletePassword(""); setDeleteError(""); }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting || !deletePassword}>
              {isDeleting ? "Eliminando..." : "Eliminar usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
