import { Download, FileText, FileSpreadsheet, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ExportButton({ moduleName = 'datos' }) {
  const handleExport = (format) => {
    alert(`Exportar ${moduleName} como ${format.toUpperCase()} — próximamente`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-border gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Exportar como</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-3 cursor-pointer">
          <FileText className="h-4 w-4 text-destructive" />
          <div>
            <p className="text-sm font-medium">PDF</p>
            <p className="text-xs text-muted-foreground">Documento portátil</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('txt')} className="gap-3 cursor-pointer">
          <File className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">TXT</p>
            <p className="text-xs text-muted-foreground">Texto plano</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-3 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium">Excel</p>
            <p className="text-xs text-muted-foreground">Hoja de cálculo</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
