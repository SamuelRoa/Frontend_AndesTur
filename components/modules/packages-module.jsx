"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { packages } from "@/lib/api";
import { ExportButton } from "@/components/export-button";
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

export function PackagesModule() {
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    departure_date: "",
    return_date: "",
    price: "",
    available_places: "",
  });

  const loadPackages = async (p = 1) => {
    setLoading(true);
    try {
      const res = await packages.getAll({ page: p });
      setPackagesList(res.data);
      if (res.pagination) {
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      }
    } catch (err) {
      console.error("Error loading packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const filteredPackages = packagesList.filter((pkg) => {
    const haystack = `${pkg.name || ""} ${pkg.description || ""}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    loadPackages(p);
  };

  const handleCreatePackage = async (event) => {
    event.preventDefault();
    if (!newPackage.name || !newPackage.description || !newPackage.departure_date || !newPackage.return_date || !newPackage.price) return;
    setIsSaving(true);
    try {
      await packages.create({
        name: newPackage.name.trim(),
        description: newPackage.description.trim(),
        departure_date: newPackage.departure_date,
        return_date: newPackage.return_date,
        price: Number(newPackage.price),
        available_places: newPackage.available_places ? Number(newPackage.available_places) : undefined,
      });
      await loadPackages();
      setIsCreateOpen(false);
      setNewPackage({ name: "", description: "", departure_date: "", return_date: "", price: "", available_places: "" });
      toast.success("Paquete creado correctamente");
    } catch (err) {
      console.error("Error creating package:", err);
      toast.error(err?.message || "Error creando paquete");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (pkg) => {
    setEditingPackage({ ...pkg });
    setIsEditOpen(true);
  };

  const handleEditPackage = async (event) => {
    event.preventDefault();
    if (!editingPackage.name || !editingPackage.description || !editingPackage.departure_date || !editingPackage.return_date || !editingPackage.price) return;
    setIsSaving(true);
    try {
      await packages.update(editingPackage.id_package, {
        name: editingPackage.name.trim(),
        description: editingPackage.description.trim(),
        departure_date: editingPackage.departure_date,
        return_date: editingPackage.return_date,
        price: Number(editingPackage.price),
        available_places: editingPackage.available_places ? Number(editingPackage.available_places) : undefined,
      });
      await loadPackages();
      setIsEditOpen(false);
      setEditingPackage(null);
      toast.success("Paquete actualizado correctamente");
    } catch (err) {
      console.error("Error updating package:", err);
      toast.error(err?.message || "Error actualizando paquete");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este paquete?")) return;
    try {
      await packages.delete(id);
      await loadPackages();
      toast.success("Paquete eliminado correctamente");
    } catch (err) {
      console.error("Error deleting package:", err);
      toast.error(err?.message || "Error eliminando paquete");
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Cargando paquetes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Paquetes Turísticos</h1>
          <p className="text-muted-foreground mt-1">Gestión de ofertas desde la base de datos</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportButton moduleName="paquetes" />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Paquete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuevo paquete</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePackage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="package-name">Nombre</Label>
                  <Input id="package-name" value={newPackage.name} onChange={(e) => setNewPackage((c) => ({ ...c, name: e.target.value }))} placeholder="Aventura en Mérida" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-description">Descripción</Label>
                  <Textarea id="package-description" value={newPackage.description} onChange={(e) => setNewPackage((c) => ({ ...c, description: e.target.value }))} rows={4} placeholder="Describe el paquete" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="package-departure">Fecha de salida</Label>
                    <Input id="package-departure" type="date" value={newPackage.departure_date} onChange={(e) => setNewPackage((c) => ({ ...c, departure_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="package-return">Fecha de retorno</Label>
                    <Input id="package-return" type="date" value={newPackage.return_date} onChange={(e) => setNewPackage((c) => ({ ...c, return_date: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="package-price">Precio</Label>
                    <Input id="package-price" type="number" min="1" step="0.01" value={newPackage.price} onChange={(e) => setNewPackage((c) => ({ ...c, price: e.target.value }))} placeholder="250" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="package-available">Lugares disponibles</Label>
                    <Input id="package-available" type="number" min="1" value={newPackage.available_places} onChange={(e) => setNewPackage((c) => ({ ...c, available_places: e.target.value }))} placeholder="20" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? "Guardando..." : "Crear paquete"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id_package} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <CardDescription>
                {pkg.departure_date && new Date(pkg.departure_date).toLocaleDateString("es-ES")}
                {pkg.return_date && ` - ${new Date(pkg.return_date).toLocaleDateString("es-ES")}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{pkg.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Precio por Persona</p>
                  <p className="font-serif text-2xl font-bold text-primary">${parseFloat(pkg.price).toLocaleString()}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Lugares Disponibles</p>
                  <p className="font-serif text-2xl font-bold text-secondary">{pkg.available_places ?? "N/A"}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 border-border" onClick={() => openEditDialog(pkg)}>
                  <Edit2 className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-border text-destructive hover:bg-destructive/10" onClick={() => handleDeletePackage(pkg.id_package)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPackages.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">No se encontraron paquetes</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Mostrando {filteredPackages.length} de {total} paquetes</div>
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

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingPackage(null); } }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar paquete</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <form onSubmit={handleEditPackage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-package-name">Nombre</Label>
                <Input id="edit-package-name" value={editingPackage.name} onChange={(e) => setEditingPackage((c) => ({ ...c, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-package-description">Descripción</Label>
                <Textarea id="edit-package-description" value={editingPackage.description} onChange={(e) => setEditingPackage((c) => ({ ...c, description: e.target.value }))} rows={4} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-package-departure">Fecha de salida</Label>
                  <Input id="edit-package-departure" type="date" value={editingPackage.departure_date ? editingPackage.departure_date.slice(0, 10) : ''} onChange={(e) => setEditingPackage((c) => ({ ...c, departure_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-package-return">Fecha de retorno</Label>
                  <Input id="edit-package-return" type="date" value={editingPackage.return_date ? editingPackage.return_date.slice(0, 10) : ''} onChange={(e) => setEditingPackage((c) => ({ ...c, return_date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-package-price">Precio</Label>
                  <Input id="edit-package-price" type="number" min="1" step="0.01" value={editingPackage.price} onChange={(e) => setEditingPackage((c) => ({ ...c, price: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-package-available">Lugares disponibles</Label>
                  <Input id="edit-package-available" type="number" min="1" value={editingPackage.available_places || ''} onChange={(e) => setEditingPackage((c) => ({ ...c, available_places: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditingPackage(null); }}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
