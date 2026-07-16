"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { staff } from "@/lib/api";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { ExportButton } from "@/components/export-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuth } from "@/lib/auth";
import {
  Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight,
  Phone, Briefcase, User, FileText, Clock,
} from "lucide-react";
import { EmployeeDocuments } from "@/components/modules/employee-documents";
import { EmployeeSchedules } from "@/components/modules/employee-schedules";

const TYPE_LABELS = {
  guide: "Guía",
  driver: "Conductor",
  operator: "Operador",
  admin_staff: "Admin. Staff",
  other: "Otro",
};

const STATUS_MAP = {
  active: { label: "Activo", variant: "default" },
  inactive: { label: "Inactivo", variant: "secondary" },
  on_leave: { label: "De licencia", variant: "outline" },
};

const emptyEmployee = {
  name: "",
  last_name: "",
  dni: "",
  type: "guide",
  phone: "",
  email: "",
  address: "",
  birth_date: "",
  position: "",
  emergency_contact: "",
  emergency_phone: "",
  hire_date: "",
  salary: "",
  employment_status: "active",
  notes: "",
};

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

const minBirth = new Date(today);
minBirth.setFullYear(today.getFullYear() - 75);
const minBirthStr = minBirth.toISOString().split("T")[0];

const maxBirth = new Date(today);
maxBirth.setFullYear(today.getFullYear() - 16);
const maxBirthStr = maxBirth.toISOString().split("T")[0];

export function EmployeesModule({ onNavigate }) {
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === 1 || user?.permissions?.includes("*") || user?.permissions?.includes("staff:write");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formTab, setFormTab] = useState("basic");
  const [documentsEmployee, setDocumentsEmployee] = useState(null);
  const [schedulesEmployee, setSchedulesEmployee] = useState(null);
  const [userSuggestion, setUserSuggestion] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ ...emptyEmployee });

  const loadEmployees = async (p = 1) => {
    setLoading(true);
    try {
      const res = await staff.getAll({ page: p });
      setEmployees(res.data);
      if (res.pagination) {
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      }
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
    const haystack = `${emp.name || ""} ${emp.last_name || ""} ${emp.dni || ""} ${emp.phone || ""} ${emp.position || ""}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    loadEmployees(p);
  };

  const buildPayload = (data) => {
    const payload = { ...data };
    if (payload.salary === "" || payload.salary === null) delete payload.salary;
    else payload.salary = Number(payload.salary);
    if (payload.birth_date === "") payload.birth_date = null;
    if (payload.hire_date === "") payload.hire_date = null;
    if (payload.email === "") delete payload.email;

    if (payload.birth_date) {
      if (payload.birth_date < minBirthStr || payload.birth_date > maxBirthStr) {
        throw new Error("La fecha de nacimiento debe corresponder a una edad entre 16 y 75 años");
      }
    }
    if (payload.hire_date && payload.hire_date > todayStr) {
      throw new Error("La fecha de ingreso no puede ser posterior a hoy");
    }

    return payload;
  };

  const handleCreateEmployee = async (event) => {
    event.preventDefault();
    if (!newEmployee.name || !newEmployee.last_name || !newEmployee.dni) return;
    setIsSaving(true);
    try {
      const payload = buildPayload(newEmployee);
      await staff.create(payload);
      await loadEmployees();
      setIsCreateOpen(false);
      setNewEmployee({ ...emptyEmployee });
      setFormTab("basic");
      toast.success("Empleado creado correctamente");

      const created = res.data;
      if (created && (created.type === "operator" || created.type === "admin_staff")) {
        setUserSuggestion(created);
      }
    } catch (err) {
      toast.error(err?.message || "Error creando empleado");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (emp) => {
    setEditingEmployee({
      ...emp,
      salary: emp.salary ? String(emp.salary) : "",
      birth_date: emp.birth_date ? emp.birth_date.split("T")[0] : "",
      hire_date: emp.hire_date ? emp.hire_date.split("T")[0] : "",
    });
    setFormTab("basic");
    setIsEditOpen(true);
  };

  const handleEditEmployee = async (event) => {
    event.preventDefault();
    if (!editingEmployee.name || !editingEmployee.last_name || !editingEmployee.dni) return;
    setIsSaving(true);
    try {
      await staff.update(editingEmployee.id_staff, buildPayload(editingEmployee));
      await loadEmployees();
      setIsEditOpen(false);
      setEditingEmployee(null);
      toast.success("Empleado actualizado correctamente");
    } catch (err) {
      toast.error(err?.message || "Error actualizando empleado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteId) return;
    try {
      await staff.delete(deleteId);
      await loadEmployees();
      setDeleteId(null);
      toast.success("Empleado eliminado correctamente");
    } catch (err) {
      toast.error(err?.message || "Error eliminando empleado");
    }
  };

  if (loading) {
    return <ModuleSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Empleados
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de personal — {total} registros
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ExportButton moduleName="empleados" />
          {canWrite && (
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) { setNewEmployee({ ...emptyEmployee }); setFormTab("basic"); }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo empleado</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEmployee}>
                <Tabs value={formTab} onValueChange={setFormTab} className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">
                      <User className="h-4 w-4 mr-1" />
                      Info Básica
                    </TabsTrigger>
                    <TabsTrigger value="contact">
                      <Phone className="h-4 w-4 mr-1" />
                      Contacto
                    </TabsTrigger>
                    <TabsTrigger value="job">
                      <Briefcase className="h-4 w-4 mr-1" />
                      Laboral
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Nombre *</Label>
                        <Input id="new-name" value={newEmployee.name} onChange={(e) => setNewEmployee((c) => ({ ...c, name: e.target.value }))} placeholder="Ana" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-last-name">Apellido *</Label>
                        <Input id="new-last-name" value={newEmployee.last_name} onChange={(e) => setNewEmployee((c) => ({ ...c, last_name: e.target.value }))} placeholder="López" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-dni">DNI *</Label>
                        <Input id="new-dni" value={newEmployee.dni} onChange={(e) => setNewEmployee((c) => ({ ...c, dni: e.target.value }))} placeholder="12345678" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-type">Tipo *</Label>
                        <Select value={newEmployee.type} onValueChange={(v) => setNewEmployee((c) => ({ ...c, type: v }))}>
                          <SelectTrigger id="new-type"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-position">Cargo</Label>
                        <Input id="new-position" value={newEmployee.position} onChange={(e) => setNewEmployee((c) => ({ ...c, position: e.target.value }))} placeholder="Guía turístico" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-birth-date">Fecha de nacimiento</Label>
                      <Input id="new-birth-date" type="date" value={newEmployee.birth_date} onChange={(e) => setNewEmployee((c) => ({ ...c, birth_date: e.target.value }))} min={minBirthStr} max={maxBirthStr} />
                      <p className="text-xs text-muted-foreground">Edad permitida: 16 a 75 años</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-phone">Teléfono</Label>
                        <Input id="new-phone" value={newEmployee.phone} onChange={(e) => setNewEmployee((c) => ({ ...c, phone: e.target.value }))} placeholder="+58 412 123 4567" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input id="new-email" type="email" value={newEmployee.email} onChange={(e) => setNewEmployee((c) => ({ ...c, email: e.target.value }))} placeholder="ana@ejemplo.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-address">Dirección</Label>
                      <Textarea id="new-address" value={newEmployee.address} onChange={(e) => setNewEmployee((c) => ({ ...c, address: e.target.value }))} placeholder="Calle, ciudad, estado..." />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-emergency-contact">Contacto de emergencia</Label>
                        <Input id="new-emergency-contact" value={newEmployee.emergency_contact} onChange={(e) => setNewEmployee((c) => ({ ...c, emergency_contact: e.target.value }))} placeholder="María López" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-emergency-phone">Tel. emergencia</Label>
                        <Input id="new-emergency-phone" value={newEmployee.emergency_phone} onChange={(e) => setNewEmployee((c) => ({ ...c, emergency_phone: e.target.value }))} placeholder="+58 414 765 4321" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="job" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-hire-date">Fecha de ingreso</Label>
                        <Input id="new-hire-date" type="date" value={newEmployee.hire_date} onChange={(e) => setNewEmployee((c) => ({ ...c, hire_date: e.target.value }))} max={todayStr} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-salary">Salario quincenal ($)</Label>
                        <Input id="new-salary" type="number" step="0.01" min="0" value={newEmployee.salary} onChange={(e) => setNewEmployee((c) => ({ ...c, salary: e.target.value }))} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-status">Estado</Label>
                        <Select value={newEmployee.employment_status} onValueChange={(v) => setNewEmployee((c) => ({ ...c, employment_status: v }))}>
                          <SelectTrigger id="new-status"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            <SelectItem value="on_leave">De licencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-notes">Notas</Label>
                      <Textarea id="new-notes" value={newEmployee.notes} onChange={(e) => setNewEmployee((c) => ({ ...c, notes: e.target.value }))} placeholder="Observaciones internas..." />
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setNewEmployee({ ...emptyEmployee }); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Crear empleado"}
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
          placeholder="Buscar por nombre, apellido, DNI, teléfono o cargo..."
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap">DNI</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap">Cargo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap">Estado</th>
                {canWrite && <th className="px-4 py-3 text-right text-sm font-semibold text-foreground whitespace-nowrap">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((emp) => {
                const status = STATUS_MAP[emp.employment_status] || STATUS_MAP.active;
                return (
                  <tr key={emp.id_staff} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {emp.name} {emp.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.dni}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.phone || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.position || "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {TYPE_LABELS[emp.type] || emp.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setDocumentsEmployee(emp)} title="Documentos">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSchedulesEmployee(emp)} title="Horarios">
                        <Clock className="h-4 w-4" />
                      </Button>
                      {canWrite && (
                      <>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => openEditDialog(emp)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(emp.id_staff)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={canWrite ? 9 : 8} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron empleados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredEmployees.length} de {total} empleados
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

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingEmployee(null); } }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar empleado</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleEditEmployee}>
              <Tabs value={formTab} onValueChange={setFormTab} className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">
                    <User className="h-4 w-4 mr-1" />
                    Info Básica
                  </TabsTrigger>
                  <TabsTrigger value="contact">
                    <Phone className="h-4 w-4 mr-1" />
                    Contacto
                  </TabsTrigger>
                  <TabsTrigger value="job">
                    <Briefcase className="h-4 w-4 mr-1" />
                    Laboral
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Nombre *</Label>
                      <Input id="edit-name" value={editingEmployee.name} onChange={(e) => setEditingEmployee((c) => ({ ...c, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-last-name">Apellido *</Label>
                      <Input id="edit-last-name" value={editingEmployee.last_name} onChange={(e) => setEditingEmployee((c) => ({ ...c, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-dni">DNI *</Label>
                      <Input id="edit-dni" value={editingEmployee.dni} onChange={(e) => setEditingEmployee((c) => ({ ...c, dni: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Tipo *</Label>
                      <Select value={editingEmployee.type} onValueChange={(v) => setEditingEmployee((c) => ({ ...c, type: v }))}>
                        <SelectTrigger id="edit-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-position">Cargo</Label>
                      <Input id="edit-position" value={editingEmployee.position || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, position: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-birth-date">Fecha de nacimiento</Label>
                    <Input id="edit-birth-date" type="date" value={editingEmployee.birth_date || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, birth_date: e.target.value }))} min={minBirthStr} max={maxBirthStr} />
                    <p className="text-xs text-muted-foreground">Edad permitida: 16 a 75 años</p>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Teléfono</Label>
                      <Input id="edit-phone" value={editingEmployee.phone || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input id="edit-email" type="email" value={editingEmployee.email || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Dirección</Label>
                    <Textarea id="edit-address" value={editingEmployee.address || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, address: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-emergency-contact">Contacto de emergencia</Label>
                      <Input id="edit-emergency-contact" value={editingEmployee.emergency_contact || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, emergency_contact: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-emergency-phone">Tel. emergencia</Label>
                      <Input id="edit-emergency-phone" value={editingEmployee.emergency_phone || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, emergency_phone: e.target.value }))} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="job" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-hire-date">Fecha de ingreso</Label>
                      <Input id="edit-hire-date" type="date" value={editingEmployee.hire_date || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, hire_date: e.target.value }))} max={todayStr} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-salary">Salario quincenal ($)</Label>
                      <Input id="edit-salary" type="number" step="0.01" min="0" value={editingEmployee.salary || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, salary: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Estado</Label>
                      <Select value={editingEmployee.employment_status} onValueChange={(v) => setEditingEmployee((c) => ({ ...c, employment_status: v }))}>
                        <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                          <SelectItem value="on_leave">De licencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Notas</Label>
                    <Textarea id="edit-notes" value={editingEmployee.notes || ""} onChange={(e) => setEditingEmployee((c) => ({ ...c, notes: e.target.value }))} />
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
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

      <EmployeeDocuments
        employee={documentsEmployee}
        open={documentsEmployee !== null}
        onClose={() => setDocumentsEmployee(null)}
      />

      <EmployeeSchedules
        employee={schedulesEmployee}
        open={schedulesEmployee !== null}
        onClose={() => setSchedulesEmployee(null)}
      />

      <Dialog open={userSuggestion !== null} onOpenChange={(v) => { if (!v) setUserSuggestion(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear usuario del sistema</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            El empleado <strong>{userSuggestion?.name} {userSuggestion?.last_name}</strong> tiene el tipo "
            {userSuggestion?.type === "operator" ? "Operador" : "Admin. Staff"}".
            ¿Deseas crear un usuario para que pueda acceder al sistema?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUserSuggestion(null)}>
              No, gracias
            </Button>
            <Button onClick={() => {
              const emp = userSuggestion;
              sessionStorage.setItem("userPrefill", JSON.stringify({
                name: emp.name,
                last_name: emp.last_name,
                email: emp.email || "",
                id_staff: emp.id_staff,
              }));
              setUserSuggestion(null);
              if (onNavigate) onNavigate("users");
            }}>
              Sí, crear usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onConfirm={handleDeleteEmployee}
        onCancel={() => setDeleteId(null)}
        title="Eliminar empleado"
        message="¿Estás seguro de eliminar este empleado?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
      />
    </div>
  );
}