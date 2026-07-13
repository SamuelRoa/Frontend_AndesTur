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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  customers,
  packages,
  reservations,
  paymentHeaders,
  destinations,
  payments,
} from "@/lib/api";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { ExportButton } from "@/components/export-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuth } from "@/lib/auth";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Banknote,
  CreditCard,
  Phone,
} from "lucide-react";

const PAYMENT_METHOD_LABELS = {
  cash: { label: "Efectivo", icon: DollarSign, color: "text-green-600" },
  card: { label: "Tarjeta", icon: CreditCard, color: "text-blue-600" },
  zelle: { label: "Zelle", icon: Banknote, color: "text-purple-600" },
  pago_movil: { label: "Pago Móvil", icon: Phone, color: "text-emerald-600" },
  digital_transfer: { label: "Transferencia", icon: Banknote, color: "text-amber-600" },
};

export function ReservationsModule() {
  const { user } = useAuth();
  const canWrite =
    user?.role === "admin" ||
    user?.role === 1 ||
    user?.permissions?.includes("*") ||
    user?.permissions?.includes("reservations:write");
  const [reservationList, setReservationList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [paymentHeaderList, setPaymentHeaderList] = useState([]);
  const [paymentSummaryByReservation, setPaymentSummaryByReservation] =
    useState({});
  const [destinationsList, setDestinationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [payStateFilter, setPayStateFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentReservation, setPaymentReservation] = useState(null);
  const [manualPayment, setManualPayment] = useState({
    pay_method: "cash",
    amount_paid: "",
    reference: "",
  });
  const [newReservation, setNewReservation] = useState({
    id_package: "",
    id_customer: "",
    reservation_date: new Date().toISOString().slice(0, 10),
    pay_state: "pending",
  });

  const loadReservations = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (payStateFilter && payStateFilter !== "all")
        params.pay_state = payStateFilter;
      if (destinationFilter && destinationFilter !== "all")
        params.id_destination = destinationFilter;

      const results = await Promise.allSettled([
        reservations.getAll(params),
        customers.getAll({ all: true }),
        packages.getAll({ all: true }),
        paymentHeaders.getAll({ all: true }),
        destinations.getAll({ all: true }),
      ]);

      const [
        reservationRes,
        customerRes,
        packageRes,
        paymentHeaderRes,
        destRes,
      ] = results.map((r) =>
        r.status === "fulfilled" ? r.value : { data: [], pagination: null },
      );

      const paymentSummaries = {};
      for (const reservation of reservationRes.data || []) {
        try {
          const summary = await payments.getByReservation(
            reservation.id_reservation,
          );
          if (summary?.data?.headers?.length) {
            paymentSummaries[reservation.id_reservation] = summary.data;
          }
        } catch (err) {
          console.warn(
            "No se pudo cargar resumen de pagos para reserva",
            reservation.id_reservation,
            err,
          );
        }
      }
      setPaymentSummaryByReservation(paymentSummaries);

      setReservationList(reservationRes.data);
      if (reservationRes.pagination) {
        setPage(reservationRes.pagination.page);
        setTotalPages(reservationRes.pagination.totalPages);
        setTotal(reservationRes.pagination.total);
      }
      setCustomersList(customerRes.data);
      setPackagesList(packageRes.data);
      setPaymentHeaderList(paymentHeaderRes.data);
      setDestinationsList(destRes.data);

      const errors = results.filter((r) => r.status === "rejected");
      if (errors.length > 0) {
        errors.forEach((e) =>
          console.warn(
            "Error en carga de datos:",
            e.reason?.message || e.reason,
          ),
        );
      }
    } catch (err) {
      console.error("Error loading reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    loadReservations(1);
  }, [payStateFilter, destinationFilter]);

  const customersById = Object.fromEntries(
    customersList.map((customer) => [customer.id_customer, customer]),
  );
  const packagesById = Object.fromEntries(
    packagesList.map((pkg) => [pkg.id_package, pkg]),
  );
  const paymentByReservationId = Object.fromEntries(
    paymentHeaderList.map((payment) => [
      payment.id_reservation,
      payment.total_amount,
    ]),
  );

  const normalizedReservations = reservationList.map((reservation) => {
    const customer = customersById[reservation.id_customer];
    const pkg = packagesById[reservation.id_package];
    return {
      ...reservation,
      customerName: customer?.name || "Cliente no encontrado",
      customerEmail: customer?.email || "Sin email",
      customerPhone: customer?.phone_number || "Sin teléfono",
      packageName: pkg?.name || "Paquete desconocido",
      packagePrice: pkg?.price != null ? Number(pkg.price) : null,
      departureDate: pkg?.departure_date || null,
      returnDate: pkg?.return_date || null,
      totalAmount: paymentByReservationId[reservation.id_reservation] ?? null,
    };
  });

  const filteredReservations = normalizedReservations.filter((reservation) => {
    const haystack =
      `${reservation.customerName} ${reservation.customerEmail} ${reservation.packageName}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    loadReservations(p);
  };

  const handleCreateReservation = async (event) => {
    event.preventDefault();
    if (!newReservation.id_package || !newReservation.id_customer) return;
    setIsSaving(true);
    try {
      await reservations.create({
        id_package: Number(newReservation.id_package),
        id_customer: Number(newReservation.id_customer),
        reservation_date: newReservation.reservation_date,
        pay_state: newReservation.pay_state,
      });
      await loadReservations();
      setIsCreateOpen(false);
      setNewReservation({
        id_package: "",
        id_customer: "",
        reservation_date: new Date().toISOString().slice(0, 10),
        pay_state: "pending",
      });
      toast.success("Reserva creada correctamente");
    } catch (err) {
      console.error("Error creating reservation:", err);
      toast.error(err?.message || "Error creando reserva");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (res) => {
    setEditingReservation({ ...res });
    setIsEditOpen(true);
  };

  const handleEditReservation = async (event) => {
    event.preventDefault();
    if (!editingReservation.id_package || !editingReservation.id_customer)
      return;
    setIsSaving(true);
    try {
      await reservations.update(editingReservation.id_reservation, {
        id_package: Number(editingReservation.id_package),
        id_customer: Number(editingReservation.id_customer),
        reservation_date: editingReservation.reservation_date,
        pay_state: editingReservation.pay_state,
      });
      await loadReservations();
      setIsEditOpen(false);
      setEditingReservation(null);
      toast.success("Reserva actualizada correctamente");
    } catch (err) {
      console.error("Error updating reservation:", err);
      toast.error(err?.message || "Error actualizando reserva");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!confirmAction || confirmAction.type !== "delete") return;
    try {
      await reservations.delete(confirmAction.id);
      await loadReservations();
      setConfirmAction(null);
      toast.success("Reserva eliminada correctamente");
    } catch (err) {
      console.error("Error deleting reservation:", err);
      toast.error(err?.message || "Error eliminando reserva");
    }
  };

  const handleOpenManualPayment = (res) => {
    setPaymentReservation(res);
    setManualPayment({
      pay_method: "cash",
      amount_paid: res.packagePrice || "",
      reference: "",
    });
    setIsPaymentDialogOpen(true);
  };

  const handleRegisterManualPayment = async (event) => {
    event.preventDefault();
    if (!paymentReservation || !manualPayment.amount_paid) return;
    setIsSaving(true);
    try {
      await payments.registerManual({
        id_reservation: paymentReservation.id_reservation,
        pay_method: manualPayment.pay_method,
        amount_paid: Number(manualPayment.amount_paid),
        reference: manualPayment.reference || undefined,
      });
      await loadReservations();
      setIsPaymentDialogOpen(false);
      setPaymentReservation(null);
      toast.success("Pago registrado correctamente");
    } catch (err) {
      console.error("Error registrando pago manual:", err);
      toast.error(err?.message || "Error al registrar pago");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveReservation = async () => {
    if (!confirmAction || confirmAction.type !== "approve") return;
    setIsSaving(true);
    try {
      await reservations.update(confirmAction.id, { pay_state: "paid" });
      await loadReservations();
      setConfirmAction(null);
      toast.success("Reserva aprobada correctamente");
    } catch (err) {
      console.error("Error approving reservation:", err);
      toast.error(err?.message || "Error al aprobar la reserva");
    } finally {
      setIsSaving(false);
    }
  };

  const getPayStateLabel = (state) => {
    switch (state) {
      case "paid":
        return "Pagado";
      case "partial":
        return "Parcial";
      case "rejected":
        return "Rechazado";
      case "cancelled":
        return "Cancelado";
      case "expired":
        return "Expirado";
      default:
        return "Pendiente";
    }
  };

  if (loading) {
    return <ModuleSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Reservas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de reservaciones de clientes
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportButton moduleName="reservas" />
          {canWrite && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" /> Nueva Reserva
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nueva reserva</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateReservation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reservation-customer">Cliente</Label>
                    <Select
                      value={newReservation.id_customer}
                      onValueChange={(value) =>
                        setNewReservation((c) => ({ ...c, id_customer: value }))
                      }
                    >
                      <SelectTrigger
                        id="reservation-customer"
                        className="w-full"
                      >
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customersList.map((customer) => (
                          <SelectItem
                            key={customer.id_customer}
                            value={String(customer.id_customer)}
                          >
                            {customer.name} {customer.lastname || ""} (
                            {customer.email || customer.dni})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reservation-package">Paquete</Label>
                    <Select
                      value={newReservation.id_package}
                      onValueChange={(value) =>
                        setNewReservation((c) => ({ ...c, id_package: value }))
                      }
                    >
                      <SelectTrigger
                        id="reservation-package"
                        className="w-full"
                      >
                        <SelectValue placeholder="Selecciona un paquete" />
                      </SelectTrigger>
                      <SelectContent>
                        {packagesList.map((pkg) => (
                          <SelectItem
                            key={pkg.id_package}
                            value={String(pkg.id_package)}
                          >
                            {pkg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reservation-date">Fecha de reserva</Label>
                      <Input
                        id="reservation-date"
                        type="date"
                        value={newReservation.reservation_date}
                        onChange={(e) =>
                          setNewReservation((c) => ({
                            ...c,
                            reservation_date: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reservation-state">Estado de pago</Label>
                      <Select
                        value={newReservation.pay_state}
                        onValueChange={(value) =>
                          setNewReservation((c) => ({ ...c, pay_state: value }))
                        }
                      >
                        <SelectTrigger
                          id="reservation-state"
                          className="w-full"
                        >
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="rejected">Rechazado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {isSaving ? "Guardando..." : "Crear reserva"}
                </Button>
              </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, email o paquete..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border"
          />
        </div>
        <Select
          value={payStateFilter}
          onValueChange={(v) => setPayStateFilter(v)}
        >
          <SelectTrigger className="w-full sm:w-44 border-border">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={destinationFilter}
          onValueChange={(v) => setDestinationFilter(v)}
        >
          <SelectTrigger className="w-full sm:w-56 border-border">
            <SelectValue placeholder="Todos los destinos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los destinos</SelectItem>
            {destinationsList.map((dest) => (
              <SelectItem
                key={dest.id_destination}
                value={String(dest.id_destination)}
              >
                {dest.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReservations.map((reservation) => (
          <Card
            key={reservation.id_reservation}
            className="border-border hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {reservation.customerName}
                  </CardTitle>
                  <CardDescription>{reservation.packageName}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {reservation.pay_state === "paid" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">
                    {reservation.customerEmail}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="text-foreground">
                    {reservation.customerPhone}
                  </span>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reserva:</span>
                  <span className="text-foreground font-medium">
                    {new Date(reservation.reservation_date).toLocaleDateString(
                      "es-ES",
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salida:</span>
                  <span className="text-foreground font-medium">
                    {reservation.departureDate
                      ? new Date(reservation.departureDate).toLocaleDateString(
                          "es-ES",
                        )
                      : "Sin fecha"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Retorno:</span>
                  <span className="text-foreground font-medium">
                    {reservation.returnDate
                      ? new Date(reservation.returnDate).toLocaleDateString(
                          "es-ES",
                        )
                      : "Sin fecha"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/10 p-3 rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Precio del paquete
                  </p>
                  <p className="font-serif text-xl font-bold text-primary">
                    {reservation.packagePrice != null
                      ? `$${reservation.packagePrice.toLocaleString()}`
                      : "Sin precio"}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Total pagado</p>
                  <p className="font-serif text-xl font-bold text-primary">
                    {reservation.totalAmount != null
                      ? `$${Number(reservation.totalAmount).toLocaleString()}`
                      : "Sin pagos"}
                  </p>
                </div>
              </div>
              {paymentSummaryByReservation[reservation.id_reservation] && (
                <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pagos registrados
                  </p>
                  {paymentSummaryByReservation[
                    reservation.id_reservation
                  ].details?.map((detail) => {
                    const methodCfg = PAYMENT_METHOD_LABELS[detail.pay_method] || { label: detail.pay_method, icon: DollarSign, color: "text-muted-foreground" };
                    const Icon = methodCfg.icon;
                    return (
                      <div
                        key={detail.id_payment_detail}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${methodCfg.color}`} />
                          {methodCfg.label}
                        </span>
                        <span className="font-medium font-mono text-xs">
                          {detail.reference || `$${Number(detail.amount_paid).toLocaleString()}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                    reservation.pay_state === "paid"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : reservation.pay_state === "partial"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : reservation.pay_state === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  {getPayStateLabel(reservation.pay_state)}
                </span>
                {reservation.totalAmount != null &&
                  reservation.packagePrice != null && (
                    <span
                      className={`text-xs font-medium ${
                        reservation.totalAmount >= reservation.packagePrice
                          ? "text-green-600 dark:text-green-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {reservation.totalAmount >= reservation.packagePrice
                        ? "Cancelado"
                        : `Saldo: $${(reservation.packagePrice - reservation.totalAmount).toLocaleString()}`}
                    </span>
                  )}
              </div>
              {canWrite && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {reservation.pay_state !== "paid" && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() =>
                        setConfirmAction({
                          type: "approve",
                          id: reservation.id_reservation,
                        })
                      }
                      disabled={isSaving}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Aprobar
                    </Button>
                  )}
                  {reservation.pay_state !== "paid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border"
                      onClick={() => handleOpenManualPayment(reservation)}
                      disabled={isSaving}
                    >
                      <DollarSign className="h-4 w-4 mr-1" /> Registrar pago
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border"
                    onClick={() => openEditDialog(reservation)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      setConfirmAction({
                        type: "delete",
                        id: reservation.id_reservation,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredReservations.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No se encontraron reservas
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredReservations.length} de {total} reservas
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className="min-w-9"
                onClick={() => goToPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditOpen(false);
            setEditingReservation(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar reserva</DialogTitle>
          </DialogHeader>
          {editingReservation && (
            <form onSubmit={handleEditReservation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-reservation-customer">Cliente</Label>
                <Select
                  value={String(editingReservation.id_customer)}
                  onValueChange={(value) =>
                    setEditingReservation((c) => ({ ...c, id_customer: value }))
                  }
                >
                  <SelectTrigger
                    id="edit-reservation-customer"
                    className="w-full"
                  >
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersList.map((customer) => (
                      <SelectItem
                        key={customer.id_customer}
                        value={String(customer.id_customer)}
                      >
                        {customer.name} {customer.lastname || ""} (
                        {customer.email || customer.dni})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reservation-package">Paquete</Label>
                <Select
                  value={String(editingReservation.id_package)}
                  onValueChange={(value) =>
                    setEditingReservation((c) => ({ ...c, id_package: value }))
                  }
                >
                  <SelectTrigger
                    id="edit-reservation-package"
                    className="w-full"
                  >
                    <SelectValue placeholder="Selecciona un paquete" />
                  </SelectTrigger>
                  <SelectContent>
                    {packagesList.map((pkg) => (
                      <SelectItem
                        key={pkg.id_package}
                        value={String(pkg.id_package)}
                      >
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-reservation-date">
                    Fecha de reserva
                  </Label>
                  <Input
                    id="edit-reservation-date"
                    type="date"
                    value={
                      editingReservation.reservation_date
                        ? editingReservation.reservation_date.slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setEditingReservation((c) => ({
                        ...c,
                        reservation_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reservation-state">Estado de pago</Label>
                  <Select
                    value={editingReservation.pay_state}
                    onValueChange={(value) =>
                      setEditingReservation((c) => ({ ...c, pay_state: value }))
                    }
                  >
                    <SelectTrigger
                      id="edit-reservation-state"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="rejected">Rechazado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingReservation(null);
                  }}
                >
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

      <ConfirmDialog
        open={confirmAction?.type === "delete"}
        onConfirm={handleDeleteReservation}
        onCancel={() => setConfirmAction(null)}
        title="Eliminar reserva"
        message="¿Estás seguro de eliminar esta reserva?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
      />

      <ConfirmDialog
        open={confirmAction?.type === "approve"}
        onConfirm={handleApproveReservation}
        onCancel={() => setConfirmAction(null)}
        title="Aprobar reserva"
        message="¿Estás seguro de aprobar y validar esta reserva? Se enviará un correo de confirmación al cliente."
        confirmLabel="Aprobar"
        cancelLabel="Cancelar"
      />

      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsPaymentDialogOpen(false);
            setPaymentReservation(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar pago manual</DialogTitle>
          </DialogHeader>
          {paymentReservation && (
            <form onSubmit={handleRegisterManualPayment} className="space-y-4">
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{paymentReservation.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paquete:</span>
                  <span className="font-medium">{paymentReservation.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio:</span>
                  <span className="font-medium text-primary">${Number(paymentReservation.packagePrice || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-pay-method">Método de pago</Label>
                <Select
                  value={manualPayment.pay_method}
                  onValueChange={(value) =>
                    setManualPayment((p) => ({ ...p, pay_method: value }))
                  }
                >
                  <SelectTrigger id="manual-pay-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                    <SelectItem value="digital_transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-amount">Monto recibido ($)</Label>
                <Input
                  id="manual-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualPayment.amount_paid}
                  onChange={(e) =>
                    setManualPayment((p) => ({ ...p, amount_paid: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-reference">Referencia (opcional)</Label>
                <Input
                  id="manual-reference"
                  value={manualPayment.reference}
                  onChange={(e) =>
                    setManualPayment((p) => ({ ...p, reference: e.target.value }))
                  }
                  placeholder="N° de referencia o comprobante"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPaymentDialogOpen(false);
                    setPaymentReservation(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Registrar pago"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
