import { Component, OnInit } from '@angular/core';
import { HorasextraService } from 'src/app/services/horasextra.service';
import { AuthService } from 'src/app/services/auth.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { MenuComponent } from '../menu/menu.component';
import { CommonModule } from '@angular/common';
import { FilterNamePipe } from 'src/app/shared/filter-name.pipe';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Horasextra } from 'src/app/services/horasextra.service';
import { forkJoin } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { SafeUrlPipe } from 'src/app/shared/safe-url.pipe';

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  registerables,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

declare var bootstrap: any;

@Component({
  selector: 'app-horasextra-admin',
  imports: [
    MenuComponent,
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    SafeUrlPipe,
  ],
  templateUrl: './horasextra-admin.component.html',
  styleUrl: './horasextra-admin.component.scss',
})
export class HorasextraAdminComponent {
  graficoEstado: any;
  usuario: any = {};
  filtroNombre: string = '';
  itemsPerPage: number = 5;
  currentPage: number = 1;
  horasextras: Horasextra[] = [];
  formhorasextra!: FormGroup;
  archivoSeleccionado!: File | null;
  contratos: any[] = [];
  contratoId: any = {};
  contratoNombre: any = {};
  graficoUsuario: Chart | undefined;
  graficoArea: Chart | undefined;
  idHoraExtraSeleccionada: number = 0;
  nuevoEstadoSeleccionado: number = 0;
  totalPages1: number[] = [];
  tienePermiso: boolean = false;
  archivoActual: string | null = null;
  chartEstado: any;
  constructor(
    private horasextraService: HorasextraService,
    private formBuilder: FormBuilder,
    private fb: FormBuilder
  ) {
    this.formhorasextra = this.fb.group({
      contratoId: [''],
      fechaInicio: [''],
      fechaFin: [''],
      motivo: [''],
      horas: [''],
      usuarioId: [''],
    });
  }
  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
      this.tienePermiso = [1, 4].includes(this.usuario?.rol);
    }
    this.formhorasextra = this.fb.group({
      descrip: ['', [Validators.required, Validators.maxLength(500)]],
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      contratoId: ['', Validators.required],
    });
    this.cargarhorasextras();
  }
  get horasextrasFiltradas() {
    const filtroLower = this.filtroNombre.toLowerCase();

    return this.horasextras.filter((horasextra) => {
      const usuario = horasextra?.contrato?.hoja_de_vida?.usuario;
      if (!usuario) return false;

      const nombreCompleto = `${usuario.primerNombre ?? ''} ${
        usuario.segundoNombre ?? ''
      } ${usuario.primerApellido ?? ''} ${
        usuario.segundoApellido ?? ''
      }`.toLowerCase();
      const documento = usuario.numDocumento.toString();

      return (
        nombreCompleto.includes(filtroLower) || documento.includes(filtroLower)
      );
    });
  }
  onArchivoSeleccionado(event: any): void {
    this.archivoSeleccionado = event.target.files[0] ?? null;
  }

  get paginatedhorasextras(): Horasextra[] {
    const filtro = this.filtroNombre?.toLowerCase() || '';

    // 1. Filtrar primero por nombre o documento
    const filtradas = this.horasextras.filter((i) => {
      const usuario = i.contrato?.hoja_de_vida?.usuario;
      const nombre = `${usuario?.primerNombre ?? ''} ${
        usuario?.primerApellido ?? ''
      }`.toLowerCase();
      const documento = `${usuario?.numDocumento ?? ''}`;
      return nombre.includes(filtro) || documento.includes(filtro);
    });

    // 2. Luego calcular total de páginas para el paginador
    this.totalPages1 = Array(Math.ceil(filtradas.length / this.itemsPerPage))
      .fill(0)
      .map((_, i) => i + 1);

    // 3. Aplicar paginación
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return filtradas.slice(inicio, fin);
  }

  abrirModalReporteUsuarios(): void {
    const modalEl = document.getElementById('modalReporteUsuario');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
    this.generarGraficoPorUsuario();
  }
  abrirModalReporteEstado(): void {
    const modalEl = document.getElementById('modalReporteEstado');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
    this.generarGraficoPorEstado();
  }
  verificarPermiso(): boolean {
    return [1, 4].includes(this.usuario?.rol);
  }

  abrirModalReporteArea(): void {
    const modalEl = document.getElementById('modalReporteArea');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
    this.dibujarGraficoPorArea();
  }
  generarGraficoPorUsuario() {
    const datosAgrupados = this.horasextras.reduce((acc: any, inc: any) => {
      const doc =
        inc.contrato?.hoja_de_vida?.usuario?.numDocumento || 'Sin documento';
      if (!acc[doc]) acc[doc] = 0;
      acc[doc] += inc.nHorasExtra || 0;
      return acc;
    }, {});

    const etiquetas = Object.keys(datosAgrupados);
    const valores = Object.values(datosAgrupados);

    const colores = etiquetas.map(() => this.generarColorAleatorio());

    new Chart('graficoUsuario', {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Cantidad de Horas',
            data: valores,
            backgroundColor: colores,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Horas Extra por Usuario (Documento)',
            font: { size: 16 },
          },
        },
      },
    });
  }

  dibujarGraficoPorArea() {
    const datosAgrupados = this.horasextras.reduce((acc: any, inc: any) => {
      const area = inc.contrato?.area?.nombreArea || 'Sin área';
      if (!acc[area]) acc[area] = 0;
      acc[area] += inc.nHorasExtra || 0;
      return acc;
    }, {});

    const etiquetas = Object.keys(datosAgrupados);
    const valores = Object.values(datosAgrupados);

    const colores = etiquetas.map(() => this.generarColorAleatorio());

    new Chart('graficoArea', {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Cantidad de Horas',
            data: valores,
            backgroundColor: colores,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Horas Extra por Área',
            font: { size: 16 },
          },
        },
      },
    });
  }

  get totalPages(): number[] {
    const filtro = this.filtroNombre?.toLowerCase() || '';
    const filtradas = this.horasextras.filter((i) => {
      const usuario = i.contrato?.hoja_de_vida?.usuario;
      const nombre = `${usuario?.primerNombre ?? ''} ${
        usuario?.primerApellido ?? ''
      }`.toLowerCase();
      const documento = `${usuario?.numDocumento ?? ''}`;
      return nombre.includes(filtro) || documento.includes(filtro);
    });

    const total = Math.ceil(filtradas.length / this.itemsPerPage);
    return Array(total)
      .fill(0)
      .map((_, i) => i + 1);
  }

  get paginadas(): Horasextra[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.horasextrasFiltradas.slice(start, start + this.itemsPerPage);
  }
  cargarhorasextras(): void {
    this.horasextraService.obtenerTodas().subscribe({
      next: (res: Horasextra[]) => {
        this.horasextras = res || [];
      },
      error: (err) => console.error('Error al cargar horasextras', err),
    });
  }

  eliminarhorasextra(id: number): void {
    this.horasextraService.eliminar(id).subscribe({
      next: () => {
        this.horasextras = this.horasextras.filter(
          (i) => i.idHorasExtra !== id
        );
        // si usas paginador dinámico
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La horasextra ha sido eliminada correctamente.',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al eliminar la horasextra.',
        });
      },
    });
  }

  calcularDias(fechaInicio: string, fechaFinal: string): number {
    const inicio = new Date(fechaInicio);
    const final = new Date(fechaFinal);
    const diferencia = final.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24)) + 1; // incluye ambos días
  }
  anteriorPagina() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  siguientePagina() {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
    }
  }
  confirmarEliminacion(id: number, nombre: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la horasextra de .' + nombre + '.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarhorasextra(id);
      }
    });
  }
  generarGraficoPorEstado() {
    if (this.chartEstado) {
      this.chartEstado.destroy();
    }

    const conteo = {
      Aprobado: 0,
      Pendiente: 0,
      Rechazado: 0,
    };

    this.horasextras.forEach((h) => {
      if (h.estado === 1) conteo.Aprobado++;
      else if (h.estado === 0) conteo.Pendiente++;
      else if (h.estado === 2) conteo.Rechazado++;
    });

    const ctx = document.getElementById('graficoEstado') as HTMLCanvasElement;

    this.chartEstado = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Aprobado', 'Pendiente', 'Rechazado'],
        datasets: [
          {
            label: 'Cantidad de Horas Extras',
            data: [conteo.Aprobado, conteo.Pendiente, conteo.Rechazado],
            backgroundColor: ['#198754', '#ffc107', '#dc3545'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Horas Extras por Estado',
            font: { size: 16 },
          },
        },
      },
    });
  }

  descargarPDFPorUsuario() {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

    imgLogo.onload = () => {
      // Encabezado
      doc.setFillColor(4, 26, 43);
      doc.rect(0, 0, 210, 30, 'F');
      doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
      doc.setFontSize(16);
      doc.setTextColor(200);
      doc.text('ManageHR - Reporte de horasextras por Usuario', 35, 15);

      let startY = 35;

      // Insertar gráfica si existe el canvas
      const canvas: any = document.getElementById('graficoUsuario');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      // Agrupar horasextras por usuario (nombre completo)
      const agrupadoPorUsuario = this.horasextrasFiltradas.reduce(
        (acc: any, inc: any) => {
          const u = inc.contrato?.hoja_de_vida?.usuario || {};
          const nombreCompleto = `${u.primerNombre || ''} ${
            u.segundoNombre || ''
          } ${u.primerApellido || ''} ${u.segundoApellido || ''}`.trim();
          if (!acc[nombreCompleto]) acc[nombreCompleto] = [];
          acc[nombreCompleto].push(inc);
          return acc;
        },
        {}
      );

      // Para cada usuario generar tabla con horasextras
      Object.entries(agrupadoPorUsuario).forEach(([usuario, lista]: any) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Usuario: ${usuario}`, 10, startY);

        const body = lista.map((inc: any) => {
          const area = inc.contrato?.area?.nombreArea || 'N/A';
          const tipo = inc.tipo_hora_extra?.nombreTipoHoras || 'N/A';
          return [
            inc.contrato?.hoja_de_vida?.usuario?.numDocumento || 'N/A',
            area,
            tipo,
            inc.nHorasExtra,
          ];
        });

        autoTable(doc, {
          head: [['Documento', 'Área', 'Tipo de Hora', 'Cantidad de Horas']],
          body,
          startY: startY + 5,
          theme: 'grid',
          styles: { halign: 'left', fontSize: 10 },
          headStyles: { fillColor: [4, 26, 43], textColor: 255 },
          didParseCell: (data) => {
            if (data.section === 'body' && data.row.index % 2 === 0) {
              data.cell.styles.fillColor = [240, 240, 240];
            }
          },
        });

        startY = (doc as any).lastAutoTable.finalY + 10;
      });

      doc.save('horasextras_por_usuario.pdf');
    };
  }

  descargarExcelPorUsuario() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('horasextras por Usuario');

    // Agrupar horasextras por usuario (usando documento como clave)
    const horasextrasAgrupadas = this.horasextrasFiltradas.reduce(
      (acc: any, inc: any) => {
        const usuario = inc.contrato?.hoja_de_vida?.usuario || {};
        const documento = usuario?.numDocumento || 'N/A';
        if (!acc[documento]) acc[documento] = { usuario, registros: [] };
        acc[documento].registros.push(inc);
        return acc;
      },
      {}
    );

    // Recorrer cada usuario para agregar filas
    Object.values(horasextrasAgrupadas).forEach(
      ({ usuario, registros }: any) => {
        // Fila título usuario con merge y estilo
        const tituloRow = sheet.addRow([
          `Usuario: ${usuario?.primerNombre || 'Sin nombre'} ${
            usuario?.primerApellido || ''
          }`,
        ]);
        tituloRow.font = { bold: true };
        tituloRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9D9D9' },
        };
        sheet.mergeCells(`A${tituloRow.number}:F${tituloRow.number}`);

        // Fila encabezado con estilo
        const encabezadoRow = sheet.addRow([
          'Documento',
          'Área',
          'Tipo de Hora',
          'Cantidad de Horas',
        ]);
        encabezadoRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        encabezadoRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2E7D32' }, // Verde institucional
        };
        encabezadoRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        // Filas de datos por horasextra
        registros.forEach((inc: any, index: number) => {
          const usuario = inc.contrato?.hoja_de_vida?.usuario || {};
          const area = inc.contrato?.area?.nombreArea || 'N/A';
          const tipo = inc.tipo_hora_extra?.nombreTipoHoras || 'N/A';

          const row = sheet.addRow([
            usuario.numDocumento || 'N/A',
            area,
            tipo,
            inc.nHorasExtra,
          ]);

          // Color alterno en filas
          if (index % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF2F2F2' },
            };
          }

          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        });

        sheet.addRow([]); // fila vacía para separación
      }
    );

    // Ajustar anchos de columnas
    sheet.columns = [
      { key: 'documento', width: 20 },
      { key: 'correo', width: 30 },
      { key: 'fechaInicio', width: 15 },
      { key: 'fechaFinal', width: 15 },
      { key: 'dias', width: 10 },
      { key: 'archivo', width: 10 },
    ];

    // Guardar archivo Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'horasextras_por_usuario.xlsx');
    });
  }
  generarColorAleatorio(): string {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  descargarPDFPorEstado() {
  const doc = new jsPDF();
  const imgLogo = new Image();
  imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

  imgLogo.onload = () => {
    // Encabezado
    doc.setFillColor(4, 26, 43);
    doc.rect(0, 0, 210, 30, 'F');
    doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
    doc.setFontSize(16);
    doc.setTextColor(255);
    doc.text('ManageHR - Reporte de Horas Extras por Estado', 35, 15);

    let startY = 35;

    // Gráfico de barras por estado
    const canvas: any = document.getElementById('graficoEstado');
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 10, startY, 190, 80);
      startY += 90;
    }

    // Mapeo de estados
    const estadosMap: any = {
      0: 'Pendiente',
      1: 'Aprobado',
      2: 'Rechazado',
    };

    // Agrupar por estado
    const agrupado = this.horasextras.reduce((acc: any, inc: any) => {
      const estado = estadosMap[inc.estado] || 'Desconocido';
      if (!acc[estado]) acc[estado] = [];
      acc[estado].push(inc);
      return acc;
    }, {});

    // Recorrer por estado
    Object.entries(agrupado).forEach(([estado, registros]: any) => {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Estado: ${estado}`, 10, startY);

      const body = registros.map((h: any) => {
        const u = h.contrato?.hoja_de_vida?.usuario || {};
        const nombre = `${u.primerNombre || ''} ${u.primerApellido || ''}`.trim();
        return [
          h.idHorasExtra,
          nombre,
          u.numDocumento || 'N/A',
          h.fecha,
          h.tipo_hora_extra?.nombreTipoHoras || 'N/A',
          h.nHorasExtra,
          
        ];
      });

      autoTable(doc, {
        head: [[
          'ID', 'Nombre Usuario', 'Documento', 'Fecha',
          'Tipo de Hora', 'Cantidad'
        ]],
        body,
        startY: startY + 5,
        theme: 'grid',
        styles: { fontSize: 10, halign: 'left' },
        headStyles: { fillColor: [4, 26, 43], textColor: 255 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [240, 240, 240];
          }
        },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save('horasextras_por_estado.pdf');
  };
}


  descargarPDFPorArea() {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

    imgLogo.onload = () => {
      // Encabezado
      doc.setFillColor(4, 26, 43);
      doc.rect(0, 0, 210, 30, 'F');
      doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
      doc.setFontSize(16);
      doc.setTextColor(200);
      doc.text('ManageHR - Reporte de horasextras por Área', 35, 15);

      let startY = 35;

      // Insertar gráfica del canvas correcto
      const canvas: any = document.getElementById('graficoArea');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      const agrupadoPorArea = this.horasextras.reduce((acc: any, inc: any) => {
        const nombreArea = inc.contrato?.area?.nombreArea || 'Sin área';
        if (!acc[nombreArea]) acc[nombreArea] = [];
        acc[nombreArea].push(inc);
        return acc;
      }, {});

      Object.entries(agrupadoPorArea).forEach(([area, lista]: any) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Área: ${area}`, 10, startY);

        const body = lista.map((inc: any) => {
          const u = inc.contrato?.hoja_de_vida?.usuario || {};
          const tipo = inc.tipo_hora_extra?.nombreTipoHoras || 'N/A';
          return [
            u.numDocumento || 'N/A',
            `${u.primerNombre || ''} ${u.primerApellido || ''}`.trim(),
            tipo,
            inc.nHorasExtra,
          ];
        });

        autoTable(doc, {
          head: [
            [
              'Documento',
              'Nombre Usuario',
              'Tipo de Hora',
              'Cantidad de Horas',
            ],
          ],
          body,
          startY: startY + 5,
          theme: 'grid',
          styles: { halign: 'left', fontSize: 10 },
          headStyles: { fillColor: [4, 26, 43], textColor: 255 },
          didParseCell: (data) => {
            if (data.section === 'body' && data.row.index % 2 === 0) {
              data.cell.styles.fillColor = [240, 240, 240];
            }
          },
        });

        startY = (doc as any).lastAutoTable.finalY + 10;
      });

      const numDocumento =
        this.horasextras?.[0]?.contrato?.hoja_de_vida?.usuario?.numDocumento ||
        'sin_documento';
      doc.save(`horasextras_por_area_${numDocumento}.pdf`);
    };
  }
  descargarExcelPorEstado() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Horas Extras por Estado');

    const agrupadoPorEstado = this.horasextras.reduce((acc: any, inc: any) => {
      const estado = this.getNombreEstado(inc.estado) || 'Desconocido';
      if (!acc[estado]) acc[estado] = [];
      acc[estado].push(inc);
      return acc;
    }, {});

    Object.entries(agrupadoPorEstado).forEach(([estado, registros]: any) => {
      const tituloRow = sheet.addRow([`Estado: ${estado}`]);
      tituloRow.font = { bold: true };
      tituloRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      sheet.mergeCells(`A${tituloRow.number}:F${tituloRow.number}`);

      const encabezadoRow = sheet.addRow([
        'Documento',
        'Nombre Usuario',
        'Fecha',
        'Tipo de Hora',
        'Cantidad de Horas',
        'Área',
      ]);

      encabezadoRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      encabezadoRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' },
      };
      encabezadoRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      registros.forEach((inc: any, index: number) => {
        const u = inc.contrato?.hoja_de_vida?.usuario || {};
        const tipo = inc.tipo_hora_extra?.nombreTipoHoras || 'N/A';
        const nombreCompleto = `${u.primerNombre || ''} ${
          u.primerApellido || ''
        }`.trim();
        const fecha = inc.fecha || 'N/A';
        const area = inc.contrato?.area?.nombreArea || 'N/A';

        const row = sheet.addRow([
          u.numDocumento || 'N/A',
          nombreCompleto || 'Sin nombre',
          fecha,
          tipo,
          inc.nHorasExtra,
          area,
        ]);

        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        }

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      sheet.addRow([]); // Espaciado
    });

    sheet.columns = [
      { key: 'documento', width: 15 },
      { key: 'nombre', width: 25 },
      { key: 'fecha', width: 15 },
      { key: 'tipoHora', width: 20 },
      { key: 'cantidad', width: 15 },
      { key: 'area', width: 20 },
    ];

    const fecha = new Date().toISOString().split('T')[0];
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `horasextras_por_estado_${fecha}.xlsx`);
    });
  }

  descargarExcelPorArea() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('horasextras por Área');

    const agrupadoPorArea = this.horasextras.reduce((acc: any, inc: any) => {
      const area = inc.contrato?.area?.nombreArea || 'Sin área';
      if (!acc[area]) acc[area] = [];
      acc[area].push(inc);
      return acc;
    }, {});

    Object.entries(agrupadoPorArea).forEach(([area, registros]: any) => {
      const tituloRow = sheet.addRow([`Área: ${area}`]);
      tituloRow.font = { bold: true };
      tituloRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      sheet.mergeCells(`A${tituloRow.number}:G${tituloRow.number}`);

      const encabezadoRow = sheet.addRow([
        'Documento',
        'Nombre Usuario',
        'Tipo de Hora',
        'Cantidad de Horas',
      ]);

      encabezadoRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      encabezadoRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' },
      };
      encabezadoRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      registros.forEach((inc: any, index: number) => {
        const u = inc.contrato?.hoja_de_vida?.usuario || {};
        const tipo = inc.tipo_hora_extra?.nombreTipoHoras || 'N/A';
        const nombreCompleto = `${u.primerNombre || ''} ${
          u.primerApellido || ''
        }`.trim();

        const row = sheet.addRow([
          u.numDocumento || 'N/A',
          nombreCompleto || 'Sin nombre',
          tipo,
          inc.nHorasExtra,
        ]);

        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        }

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      sheet.addRow([]);
    });

    sheet.columns = [
      { key: 'documento', width: 15 },
      { key: 'nombre', width: 30 },
      { key: 'correo', width: 30 },
      { key: 'fechaInicio', width: 15 },
      { key: 'fechaFinal', width: 15 },
      { key: 'dias', width: 10 },
      { key: 'archivo', width: 10 },
    ];

    const numDocumento =
      this.horasextras?.[0]?.contrato?.hoja_de_vida?.usuario?.numDocumento ||
      'sin_documento';
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `horasextras_por_area_${numDocumento}.xlsx`);
    });
  }
  verArchivoEnModal(ruta: string) {
    this.archivoActual = `http://localhost:8000/${ruta}`;
    const modal = new bootstrap.Modal(
      document.getElementById('modalVerArchivo')
    );
    modal.show();
  }

  esPDF(ruta: string): boolean {
    return ruta.toLowerCase().endsWith('.pdf');
  }
  abrirArchivo(archivo: string) {
    if (!archivo) return;

    console.log('archivoOriginal:', archivo);
    alert('archivoOriginal: ' + archivo);

    // Si ya empieza con "http", no lo toques
    if (archivo.startsWith('http')) {
      this.archivoActual = archivo;
    } else {
      // Asegurarse de que comience con "storage/"
      const rutaNormalizada = archivo.startsWith('storage/')
        ? archivo
        : `storage/${archivo.replace(/^\/?/, '')}`;

      this.archivoActual = `http://localhost:8000/${rutaNormalizada}`;
    }

    console.log('archivoActual:', this.archivoActual);
    alert('archivoActual: ' + this.archivoActual);

    // Mostrar modal
    setTimeout(() => {
      const modalEl = document.getElementById('modalVerArchivo');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    }, 100);
  }

  getNombreEstado(estado: number): string {
    switch (estado) {
      case 0:
        return 'Pendiente';
      case 1:
        return 'Aprobado';
      case 2:
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  }
  abrirModalCambiarEstado(id: number, estadoActual: number): void {
    this.idHoraExtraSeleccionada = id;
    this.nuevoEstadoSeleccionado = estadoActual;

    const modal = new bootstrap.Modal(
      document.getElementById('modalCambiarEstado')!
    );
    modal.show();
  }

  confirmarCambioEstado(): void {
    if (this.idHoraExtraSeleccionada == null) return;

    this.horasextraService
      .cambiarEstado(this.idHoraExtraSeleccionada, this.nuevoEstadoSeleccionado)
      .subscribe({
        next: () => {
          this.cargarhorasextras();
          bootstrap.Modal.getInstance(
            document.getElementById('modalCambiarEstado')!
          )?.hide();
          Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: 'La incapacidad ha sido actualizada exitosamente.',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        },
        error: (err) => {
          console.error('Error al cambiar estado:', err);
        },
      });
  }
}
