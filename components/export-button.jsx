import { useState } from 'react'
import { toast } from 'sonner'
import { Download, FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { downloadExport } from '@/lib/api'

export function ExportButton({ moduleName = 'datos' }) {
  const [loading, setLoading] = useState(null)

  const handleExport = async (format) => {
    setLoading(format)
    try {
      await downloadExport(moduleName, format)
    } catch (err) {
      toast.error(`Error al exportar: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-border gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden md:inline">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Exportar como</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-3 cursor-pointer" disabled={loading === 'pdf'}>
          {loading === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <FileText className="h-4 w-4 text-destructive" />}
          <div>
            <p className="text-sm font-medium">PDF</p>
            <p className="text-xs text-muted-foreground">Documento portátil</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('txt')} className="gap-3 cursor-pointer" disabled={loading === 'txt'}>
          {loading === 'txt' ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <File className="h-4 w-4 text-muted-foreground" />}
          <div>
            <p className="text-sm font-medium">TXT</p>
            <p className="text-xs text-muted-foreground">Texto plano</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-3 cursor-pointer" disabled={loading === 'excel'}>
          {loading === 'excel' ? <Loader2 className="h-4 w-4 animate-spin text-green-600" /> : <FileSpreadsheet className="h-4 w-4 text-green-600" />}
          <div>
            <p className="text-sm font-medium">Excel</p>
            <p className="text-xs text-muted-foreground">Hoja de cálculo</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
