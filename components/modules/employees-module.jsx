"use client";

import { useEffect, useState } from "react";
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
import { staff } from "@/lib/api";
import { ExportButton } from "@/components/export-button";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

export function EmployeesModule() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    last_name: "",
    dni: "",
    type: "guide",
  });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await staff.getAll();
      setEmployees(res.data);
    } catch (err) {
      console.error("Error loading staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const haystack = `${emp.name || ""} ${emp.last_name || ""} ${emp.dni || ""}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const handleCreateEmployee = async (event) => {
    event.preventDefault();
    if (!newEmployee.name || !newEmployee.last_name || !newEmployee.dni) return;
    setIsSaving(true);
    try {
      await staff.create({
        name: newEmployee.name.trim(),
        last_name: newEmployee.last_name.trim(),
        dni: newEmployee.dni.trim(),
        type: newEmployee.type,
      });
      await loadEmployees();
      setIsCreateOpen(false);
      setNewEmployee({ name: "", last_name: "", dni: "", type: "guide" });
    } catch (err) {
      console.error("Error creating staff:", err);
      alert(err?.message || "Error creando empleado");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (emp) => {
    setEditingEmployee({ ...emp });
    setIsEditOpen(true);
  };

  const handleEditEmployee = async (event) => {
    event.preventDefault();
    if (!editingEmployee.name || !editingEmployee.last_name || !editingEmployee.dni) return;
    setIsSaving(true);
    try {
      await staff.update(editingEmployee.id_staff, {
        name: editingEmployee.name.trim(),
        last_name: editingEmployee.last_name.trim(),
        dni: editingEmployee.dni.trim(),
        type: editingEmployee.type,
      });
      await loadEmployees();
      setIsEditOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      console.error("Error updating staff:", err);
      alert(err?.message || "Error actualizando empleado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este empleado?")) return;
    try {
      await staff.delete(id);
      await loadEmployees();
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert(err?.message || "Error eliminando empleado");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Cargando empleados...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Empleados
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de personal desde la base de datos
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportButton moduleName="empleados" />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo empleado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-name">Nombre</Label>
                  <Input
                    id="employee-name"
                    value={newEmployee.name}
                    onChange={(event) =>
                      setNewEmployee((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Ana"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-last-name">Apellido</Label>
                  <Input
                    id="employee-last-name"
                    value={newEmployee.last_name}
                    onChange={(event) =>
                      setNewEmployee((current) => ({
                        ...current,
                        last_name: event.target.value,
                      }))
                    }
                    placeholder="López"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-dni">DNI</Label>
                  <Input
                    id="employee-dni"
                    value={newEmployee.dni}
                    onChange={(event) =>
                      setNewEmployee((current) => ({
                        ...current,
                        dni: event.target.value,
                      }))
                    }
                    placeholder="12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-type">Tipo</Label>
                  <Select
                    value={newEmployee.type}
                    onValueChange={(value) =>
                      setNewEmployee((current) => ({ ...current, type: value }))
                    }
                  >
                    <SelectTrigger id="employee-type" className="w-full">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guide">Guía</SelectItem>
                      <SelectItem value="driver">Conductor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Crear empleado"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Apellido</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">DNI</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tipo</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id_staff} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{emp.last_name}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{emp.dni}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {emp.type === "guide" ? "Guía" : emp.type === "driver" ? "Conductor" : emp.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => openEditDialog(emp)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteEmployee(emp.id_staff)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron empleados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredEmployees.length} de {employees.length} empleados
      </div>

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingEmployee(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar empleado</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-employee-name">Nombre</Label>
                  <Input
                    id="edit-employee-name"
                    value={editingEmployee.name}
                    onChange={(event) =>
                      setEditingEmployee((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-employee-last-name">Apellido</Label>
                  <Input
                    id="edit-employee-last-name"
                    value={editingEmployee.last_name}
                    onChange={(event) =>
                      setEditingEmployee((current) => ({
                        ...current,
                        last_name: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-employee-dni">DNI</Label>
                  <Input
                    id="edit-employee-dni"
                    value={editingEmployee.dni}
                    onChange={(event) =>
                      setEditingEmployee((current) => ({
                        ...current,
                        dni: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-employee-type">Tipo</Label>
                  <Select
                    value={editingEmployee.type}
                    onValueChange={(value) =>
                      setEditingEmployee((current) => ({ ...current, type: value }))
                    }
                  >
                    <SelectTrigger id="edit-employee-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guide">Guía</SelectItem>
                      <SelectItem value="driver">Conductor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditingEmployee(null); }}>
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
    </div>
  );
}
