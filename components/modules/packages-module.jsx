"use client";

import { useEffect, useState } from "react";
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
import { Plus, Edit2, Trash2, Search } from "lucide-react";

export function PackagesModule() {
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    departure_date: "",
    return_date: "",
    price: "",
    available_places: "",
  });

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await packages.getAll();
      setPackagesList(res.data);
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

  const handleCreatePackage = async (event) => {
    event.preventDefault();

    if (
      !newPackage.name ||
      !newPackage.description ||
      !newPackage.departure_date ||
      !newPackage.return_date ||
      !newPackage.price
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await packages.create({
        name: newPackage.name.trim(),
        description: newPackage.description.trim(),
        departure_date: newPackage.departure_date,
        return_date: newPackage.return_date,
        price: Number(newPackage.price),
        available_places: newPackage.available_places
          ? Number(newPackage.available_places)
          : undefined,
      });
      await loadPackages();
      setIsCreateOpen(false);
      setNewPackage({
        name: "",
        description: "",
        departure_date: "",
        return_date: "",
        price: "",
        available_places: "",
      });
    } catch (err) {
      console.error("Error creating package:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Cargando paquetes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Paquetes Turísticos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de ofertas desde la base de datos
          </p>
        </div>

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
                <Input
                  id="package-name"
                  value={newPackage.name}
                  onChange={(event) =>
                    setNewPackage((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Aventura en Mérida"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-description">Descripción</Label>
                <Textarea
                  id="package-description"
                  value={newPackage.description}
                  onChange={(event) =>
                    setNewPackage((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Describe el paquete"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package-departure">Fecha de salida</Label>
                  <Input
                    id="package-departure"
                    type="date"
                    value={newPackage.departure_date}
                    onChange={(event) =>
                      setNewPackage((current) => ({
                        ...current,
                        departure_date: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-return">Fecha de retorno</Label>
                  <Input
                    id="package-return"
                    type="date"
                    value={newPackage.return_date}
                    onChange={(event) =>
                      setNewPackage((current) => ({
                        ...current,
                        return_date: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package-price">Precio</Label>
                  <Input
                    id="package-price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={newPackage.price}
                    onChange={(event) =>
                      setNewPackage((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    placeholder="250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-available">Lugares disponibles</Label>
                  <Input
                    id="package-available"
                    type="number"
                    min="1"
                    value={newPackage.available_places}
                    onChange={(event) =>
                      setNewPackage((current) => ({
                        ...current,
                        available_places: event.target.value,
                      }))
                    }
                    placeholder="20"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Crear paquete"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="pl-10 border-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => (
          <Card
            key={pkg.id_package}
            className="border-border hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <CardDescription>
                {pkg.departure_date &&
                  new Date(pkg.departure_date).toLocaleDateString("es-ES")}
                {pkg.return_date &&
                  ` - ${new Date(pkg.return_date).toLocaleDateString("es-ES")}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{pkg.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Precio por Persona
                  </p>
                  <p className="font-serif text-2xl font-bold text-primary">
                    ${parseFloat(pkg.price).toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Lugares Disponibles
                  </p>
                  <p className="font-serif text-2xl font-bold text-secondary">
                    {pkg.available_places ?? "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPackages.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No se encontraron paquetes
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredPackages.length} de {packagesList.length} paquetes
      </div>
    </div>
  );
}
