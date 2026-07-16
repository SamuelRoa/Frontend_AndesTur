"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { staffSchedules, staffExceptions } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Clock, Calendar, Plus, Trash2, Download, Loader2,
  Sun, Moon, Sunrise, Sunset,
} from "lucide-react";

const MIN_TIME = "08:00";
const MAX_TIME = "17:00";

function isValidTime(time) {
  if (!time) return false;
  return time >= MIN_TIME && time <= MAX_TIME;
}

function clampTime(time) {
  if (!time) return MIN_TIME;
  if (time < MIN_TIME) return MIN_TIME;
  if (time > MAX_TIME) return MAX_TIME;
  return time;
}

const DAYS = [
  { value: 0, label: "Lunes" },
  { value: 1, label: "Martes" },
  { value: 2, label: "Miércoles" },
  { value: 3, label: "Jueves" },
  { value: 4, label: "Viernes" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

const EXCEPTION_REASONS = [
  "Vacaciones",
  "Permiso médico",
  "Cita médica",
  "Permiso personal",
  "Enfermedad",
  "Emergencia familiar",
  "Día feriado",
  "Capacitación",
  "Otro",
];

function formatHour(time) {
  if (!time) return "";
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

export function EmployeeSchedules({ employee, open, onClose }) {
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === 1 || user?.permissions?.includes("*") || user?.permissions?.includes("staff:write");
  const [tab, setTab] = useState("schedules");

  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [exceptions, setExceptions] = useState([]);
  const [exceptionsLoading, setExceptionsLoading] = useState(true);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionForm, setExceptionForm] = useState({
    date: "",
    reason: "",
    is_working_day: false,
    start_time: "",
    end_time: "",
    notes: "",
    attachment: null,
  });
  const [creatingException, setCreatingException] = useState(false);

  const loadSchedules = useCallback(async () => {
    if (!employee?.id_staff) return;
    setSchedulesLoading(true);
    try {
      const res = await staffSchedules.get(employee.id_staff);
      setSchedules(res.data || []);
    } catch { toast.error("Error cargando horarios"); }
    finally { setSchedulesLoading(false); }
  }, [employee?.id_staff]);

  const loadExceptions = useCallback(async () => {
    if (!employee?.id_staff) return;
    setExceptionsLoading(true);
    try {
      const res = await staffExceptions.getAll(employee.id_staff);
      setExceptions(res.data || []);
    } catch { toast.error("Error cargando excepciones"); }
    finally { setExceptionsLoading(false); }
  }, [employee?.id_staff]);

  useEffect(() => {
    if (open) {
      loadSchedules();
      loadExceptions();
      setShowExceptionForm(false);
      setExceptionForm({ date: "", reason: "", is_working_day: false, start_time: "", end_time: "", notes: "", attachment: null });
    }
  }, [open, loadSchedules, loadExceptions]);

  const getScheduleForDay = (day) => schedules.find((s) => s.day_of_week === day && s.is_active);

  const handleDayToggle = (day) => {
    const existing = getScheduleForDay(day);
    if (existing) {
      setSchedules((prev) => prev.map((s) => s.id_schedule === existing.id_schedule ? { ...s, is_active: !s.is_active } : s));
    } else {
      setSchedules((prev) => [...prev, { id_schedule: `new_${day}`, day_of_week: day, start_time: "08:00", end_time: "17:00", is_active: true }]);
    }
  };

  const updateScheduleTime = (day, field, value) => {
    const clamped = clampTime(value);
    setSchedules((prev) => prev.map((s) => s.day_of_week === day ? { ...s, [field]: clamped } : s));
  };

  const handleSaveSchedules = async () => {
    const activeSchedules = schedules.filter((s) => s.is_active);
    for (const s of activeSchedules) {
      if (!isValidTime(s.start_time) || !isValidTime(s.end_time)) {
        toast.error(`Horario inválido: ${DAYS[s.day_of_week].label}. Las horas deben estar entre 08:00 y 17:00.`);
        return;
      }
      if (s.start_time >= s.end_time) {
        toast.error(`Horario inválido: ${DAYS[s.day_of_week].label}. La hora de inicio debe ser menor a la de fin.`);
        return;
      }
    }
    setSaving(true);
    try {
      await staffSchedules.save(employee.id_staff, activeSchedules);
      await loadSchedules();
      toast.success("Horarios guardados correctamente");
    } catch (err) {
      toast.error(err?.message || "Error guardando horarios");
    } finally { setSaving(false); }
  };

  const handleCreateException = async (e) => {
    e.preventDefault();
    if (!exceptionForm.date || !exceptionForm.reason) return;

    if (exceptionForm.is_working_day) {
      if (exceptionForm.start_time && !isValidTime(exceptionForm.start_time)) {
        toast.error("La hora de inicio de la excepción debe estar entre 08:00 y 17:00");
        return;
      }
      if (exceptionForm.end_time && !isValidTime(exceptionForm.end_time)) {
        toast.error("La hora de fin de la excepción debe estar entre 08:00 y 17:00");
        return;
      }
      if (exceptionForm.start_time && exceptionForm.end_time && exceptionForm.start_time >= exceptionForm.end_time) {
        toast.error("La hora de inicio debe ser menor a la de fin");
        return;
      }
    }

    setCreatingException(true);
    try {
      const formData = new FormData();
      formData.append("date", exceptionForm.date);
      formData.append("reason", exceptionForm.reason);
      formData.append("is_working_day", exceptionForm.is_working_day);
      if (exceptionForm.start_time) formData.append("start_time", exceptionForm.start_time);
      if (exceptionForm.end_time) formData.append("end_time", exceptionForm.end_time);
      if (exceptionForm.notes) formData.append("notes", exceptionForm.notes);
      if (exceptionForm.attachment) formData.append("attachment", exceptionForm.attachment);
      await staffExceptions.create(employee.id_staff, formData);
      await loadExceptions();
      setShowExceptionForm(false);
      setExceptionForm({ date: "", reason: "", is_working_day: false, start_time: "", end_time: "", notes: "", attachment: null });
      toast.success("Excepción registrada");
    } catch (err) {
      toast.error(err?.message || "Error creando excepción");
    } finally { setCreatingException(false); }
  };

  const handleDeleteException = async (exp) => {
    try {
      await staffExceptions.delete(exp.id_exception);
      await loadExceptions();
      toast.success("Excepción eliminada");
    } catch (err) {
      toast.error(err?.message || "Error eliminando excepción");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Horarios — {employee?.name} {employee?.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedules">
              <Clock className="h-4 w-4 mr-1" />
              Horario Semanal
            </TabsTrigger>
            <TabsTrigger value="exceptions">
              <Calendar className="h-4 w-4 mr-1" />
              Excepciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-4 pt-4">
            {schedulesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <>
                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const schedule = getScheduleForDay(day.value);
                    const isActive = schedule?.is_active;
                    return (
                      <div key={day.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                        <button
                          type="button"
                          onClick={() => handleDayToggle(day.value)}
                          className={`w-28 text-left text-sm font-medium px-2 py-1 rounded transition-colors ${
                            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {isActive ? "✓ " : ""}{day.label}
                        </button>
                        {isActive ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={schedule.start_time || "08:00"}
                              onChange={(e) => updateScheduleTime(day.value, "start_time", e.target.value)}
                              className={`w-32 h-9 ${!isValidTime(schedule.start_time) ? "border-red-500 focus-visible:border-red-500" : ""}`}
                              min={MIN_TIME}
                              max={MAX_TIME}
                            />
                            <span className="text-muted-foreground">→</span>
                            <Input
                              type="time"
                              value={schedule.end_time || "17:00"}
                              onChange={(e) => updateScheduleTime(day.value, "end_time", e.target.value)}
                              className={`w-32 h-9 ${!isValidTime(schedule.end_time) ? "border-red-500 focus-visible:border-red-500" : ""}`}
                              min={MIN_TIME}
                              max={MAX_TIME}
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No laboral</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {canWrite && (
                  <Button onClick={handleSaveSchedules} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {saving ? "Guardando..." : "Guardar horarios"}
                  </Button>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="exceptions" className="space-y-4 pt-4">
            {canWrite && !showExceptionForm && (
              <Button onClick={() => setShowExceptionForm(true)} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Registrar excepción
              </Button>
            )}

            {showExceptionForm && (
              <form onSubmit={handleCreateException} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exc-date">Fecha *</Label>
                    <Input id="exc-date" type="date" value={exceptionForm.date} onChange={(e) => setExceptionForm((c) => ({ ...c, date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exc-reason">Motivo *</Label>
                    <Select value={exceptionForm.reason} onValueChange={(v) => setExceptionForm((c) => ({ ...c, reason: v }))}>
                      <SelectTrigger id="exc-reason"><SelectValue placeholder="Seleccionar motivo" /></SelectTrigger>
                      <SelectContent>
                        {EXCEPTION_REASONS.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="exc-is-working"
                    checked={exceptionForm.is_working_day}
                    onChange={(e) => setExceptionForm((c) => ({ ...c, is_working_day: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <Label htmlFor="exc-is-working" className="text-sm">Es día laboral (con horario diferente)</Label>
                </div>
                {exceptionForm.is_working_day && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exc-start">Hora inicio</Label>
                      <Input
                        id="exc-start" type="time"
                        value={exceptionForm.start_time}
                        onChange={(e) => setExceptionForm((c) => ({ ...c, start_time: e.target.value }))}
                        min={MIN_TIME} max={MAX_TIME}
                        className={!isValidTime(exceptionForm.start_time) && exceptionForm.start_time ? "border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exc-end">Hora fin</Label>
                      <Input
                        id="exc-end" type="time"
                        value={exceptionForm.end_time}
                        onChange={(e) => setExceptionForm((c) => ({ ...c, end_time: e.target.value }))}
                        min={MIN_TIME} max={MAX_TIME}
                        className={!isValidTime(exceptionForm.end_time) && exceptionForm.end_time ? "border-red-500" : ""}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="exc-attachment">Adjuntar comprobante (opcional)</Label>
                  <Input
                    id="exc-attachment"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setExceptionForm((c) => ({ ...c, attachment: e.target.files[0] }))}
                  />
                  <p className="text-xs text-muted-foreground">Receta médica, foto, comprobante — PDF, JPG, PNG (máx 10MB)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exc-notes">Notas (opcional)</Label>
                  <Textarea id="exc-notes" value={exceptionForm.notes} onChange={(e) => setExceptionForm((c) => ({ ...c, notes: e.target.value }))} placeholder="Observaciones..." />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={creatingException || !exceptionForm.date || !exceptionForm.reason}>
                    {creatingException ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    {creatingException ? "Guardando..." : "Registrar"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowExceptionForm(false)}>Cancelar</Button>
                </div>
              </form>
            )}

            {exceptionsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : exceptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay excepciones registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Motivo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Adjunto</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {exceptions.map((exp) => (
                      <tr key={exp.id_exception} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">
                          {new Date(exp.date).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-sm">{exp.reason}</td>
                        <td className="px-4 py-3 text-sm">
                          {exp.is_working_day ? (
                            <Badge variant="outline">Laboral atípico</Badge>
                          ) : (
                            <Badge variant="secondary">Día libre</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {exp.attachment_path ? (
                            <Button variant="ghost" size="sm" onClick={() => window.open(staffExceptions.getDownloadUrl(exp.id_exception), "_blank")}>
                              <Download className="h-4 w-4 mr-1" />
                              {exp.attachment_name || "Ver"}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canWrite && (
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteException(exp)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}