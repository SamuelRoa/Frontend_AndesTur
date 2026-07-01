"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { roles as rolesApi } from "@/lib/api";
import { Shield, Save, CheckCircle, XCircle } from "lucide-react";

const MODULES = [
  { id: "staff", label: "Empleados" },
  { id: "destinations", label: "Destinos" },
  { id: "packages", label: "Paquetes" },
  { id: "vehicles", label: "Vehículos" },
  { id: "reservations", label: "Reservas" },
  { id: "users", label: "Usuarios" },
];

const ACTIONS = [
  { id: "read", label: "Lectura" },
  { id: "write", label: "Escritura" },
];

export function RolesTab() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await rolesApi.getAll();
      setRoles(res.data);
    } catch (err) {
      console.error("Error loading roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(JSON.parse(JSON.stringify(role)));
  };

  const handleTogglePermission = (module, action) => {
    if (!editingRole) return;
    const perm = `${module}:${action}`;
    const permissions = editingRole.permissions || [];
    
    // Si el rol es admin, no se debe quitar el "*"
    if (permissions.includes("*")) return;

    if (permissions.includes(perm)) {
      setEditingRole({
        ...editingRole,
        permissions: permissions.filter((p) => p !== perm),
      });
    } else {
      setEditingRole({
        ...editingRole,
        permissions: [...permissions, perm],
      });
    }
  };

  const handleSave = async () => {
    if (!editingRole) return;
    setSaving(true);
    try {
      await rolesApi.update(editingRole.id_role, { permissions: editingRole.permissions });
      setRoles(roles.map((r) => (r.id_role === editingRole.id_role ? editingRole : r)));
      setEditingRole(null);
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Error actualizando permisos del rol");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Cargando roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Roles del Sistema</h3>
          <div className="space-y-3">
            {roles.map((role) => (
              <Card
                key={role.id_role}
                className={`p-4 cursor-pointer transition-all ${
                  editingRole?.id_role === role.id_role
                    ? "border-primary ring-1 ring-primary/50 shadow-md"
                    : "hover:border-primary/50 hover:shadow-sm"
                }`}
                onClick={() => handleEdit(role)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground capitalize">
                      {role.type === "admin" ? "Administrador" : role.type}
                    </h4>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {editingRole ? (
            <Card className="p-6 border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground capitalize">
                    Permisos de {editingRole.type === "admin" ? "Administrador" : editingRole.type}
                  </h3>
                  <p className="text-sm text-muted-foreground">Configura los accesos por módulo</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingRole(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>

              {editingRole.permissions?.includes("*") ? (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-3 opacity-80" />
                  <h4 className="text-lg font-medium text-foreground">Acceso Total</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este rol es superadministrador y tiene acceso a todos los módulos y acciones por defecto. Sus permisos no pueden ser restringidos aquí.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-foreground border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Módulo</th>
                        {ACTIONS.map((action) => (
                          <th key={action.id} className="px-4 py-3 font-semibold text-center">
                            {action.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MODULES.map((module) => (
                        <tr key={module.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium text-foreground">{module.label}</td>
                          {ACTIONS.map((action) => {
                            const hasPerm = (editingRole.permissions || []).includes(`${module.id}:${action.id}`);
                            return (
                              <td key={action.id} className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(module.id, action.id)}
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                                    hasPerm
                                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  {hasPerm ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5 opacity-40" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/20 p-12 text-center">
              <div>
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Selecciona un rol</h3>
                <p className="text-sm text-muted-foreground mt-1">Haz clic en un rol a la izquierda para editar sus permisos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
