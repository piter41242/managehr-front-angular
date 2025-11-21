import { Component, OnInit } from '@angular/core';
import { IncapacidadService } from 'src/app/services/incapacidad.service';
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
import { Incapacidad } from 'src/app/services/incapacidad.service';
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
  selector: 'app-incapacidades-admin',
  templateUrl: './incapacidades-admin.component.html',
  standalone: true,
  styleUrls: ['./incapacidades-admin.component.scss'],
  imports: [
    MenuComponent,
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    SafeUrlPipe,
  ],
})
export class IncapacidadesAdminComponent implements OnInit {
  graficoEstado: any;
  usuario: any = {};
  filtroNombre: string = '';
  itemsPerPage: number = 5;
  currentPage: number = 1;
  incapacidades: Incapacidad[] = [];
  formIncapacidad!: FormGroup;
  archivoSeleccionado!: File | null;
  contratos: any[] = [];
  contratoId: any = {};
  contratoNombre: any = {};
  graficoUsuario: Chart | undefined;
  graficoArea: Chart | undefined;

  totalPages1: number[] = [];
  tienePermiso: boolean = false;
  archivoActual: string | null = null;

  incapacidadSeleccionada: any = null;
  nuevoEstado: number = 0;
  constructor(
    private incapacidadService: IncapacidadService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
      this.tienePermiso = [1, 4].includes(this.usuario?.rol);
      //console.log('Usuario logueado:', this.usuario);
    }
    this.formIncapacidad = this.fb.group({
      descrip: ['', [Validators.required, Validators.maxLength(500)]],
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      contratoId: ['', Validators.required],
    });
    this.cargarIncapacidades();
   
  }
  get incapacidadesFiltradas() {
    const filtroLower = this.filtroNombre.toLowerCase();

    return this.incapacidades.filter((incapacidad) => {
      const usuario = incapacidad?.contrato?.hoja_de_vida?.usuario;
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

  crearIncapacidad(): void {
    if (this.formIncapacidad.invalid) return;

    const formData = new FormData();
    const valores = this.formIncapacidad.value;

    formData.append('descrip', valores.descrip);
    formData.append('fechaInicio', valores.fechaInicio);
    formData.append('fechaFinal', valores.fechaFinal);
    formData.append('contratoId', valores.contratoId);

    if (this.archivoSeleccionado) {
      formData.append('archivo', this.archivoSeleccionado);
    }

    this.incapacidadService.crear(formData).subscribe({
      next: (res) => {
        
        this.cargarIncapacidades(); // actualiza la tabla
        this.formIncapacidad.reset();
        this.archivoSeleccionado = null;
        (document.getElementById('modalAgregarIncapacidad') as any)?.click(); // cierra modal
      },
      error: (err) => {
        console.error('Error al crear incapacidad', err);
      },
    });
  }
  get paginatedIncapacidades(): Incapacidad[] {
    const filtro = this.filtroNombre?.toLowerCase() || '';

    // 1. Filtrar primero por nombre o documento
    const filtradas = this.incapacidades.filter((i) => {
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
    this.dibujarGraficoUsuario();
  }
  verificarPermiso(): boolean {
    return [1, 4].includes(this.usuario?.rol);
  }
  abrirModalReporteEstado(): void {
    const modalEl = document.getElementById('modalReporteEstado');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
    this.dibujarGraficoPorEstado();
  }

  abrirModalReporteArea(): void {
    const modalEl = document.getElementById('modalReporteArea');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
    this.dibujarGraficoPorArea();
  }
  dibujarGraficoPorEstado() {
    if (this.graficoEstado) {
      this.graficoEstado.destroy(); // destruir gráfico anterior si existe
    }

    const conteo = { Pendiente: 0, Aceptado: 0, Rechazado: 0 };

    this.incapacidades.forEach((inc) => {
      if (inc.estado === 0) conteo.Pendiente++;
      else if (inc.estado === 1) conteo.Aceptado++;
      else if (inc.estado === 2) conteo.Rechazado++;
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    const backgroundColors = ['#FFD700', '#4CAF50', '#F44336']; // Amarillo, Verde, Rojo

    const ctx = (
      document.getElementById('graficoEstado') as HTMLCanvasElement
    )?.getContext('2d');

    if (ctx) {
      this.graficoEstado = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Cantidad de Incapacidades por Estado',
              data: data,
              backgroundColor: backgroundColors,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }

  dibujarGraficoUsuario() {
    if (this.graficoUsuario) {
      this.graficoUsuario.destroy(); // destruir si ya existe para evitar duplicados
    }

    // Agrupar incapacidades por usuario y contar
    const conteoUsuarios: { [key: string]: number } = {};

    this.incapacidadesFiltradas.forEach((inc) => {
      const nombre =
        inc.contrato?.hoja_de_vida?.usuario?.primerNombre +
        ' ' +
        (inc.contrato?.hoja_de_vida?.usuario?.primerApellido || '');
      if (nombre) {
        conteoUsuarios[nombre] = (conteoUsuarios[nombre] || 0) + 1;
      }
    });

    const labels = Object.keys(conteoUsuarios);
    const data = Object.values(conteoUsuarios);

    // Generar colores aleatorios para cada barra
    const backgroundColors = data.map(() => this.generarColorAleatorio());

    const ctx = (
      document.getElementById('graficoUsuario') as HTMLCanvasElement
    ).getContext('2d');

    if (ctx) {
      this.graficoUsuario = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Cantidad de Incapacidades',
              data: data,
              backgroundColor: backgroundColors,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }
  }

  dibujarGraficoPorArea() {
    if (this.graficoArea) {
      this.graficoArea.destroy();
    }

    const conteoPorArea: { [key: string]: number } = {};

    this.incapacidades.forEach((inc) => {
      const area = inc.contrato?.area;
      const nombreArea =
        typeof area === 'object' && area !== null && 'nombreArea' in area
          ? (area as any).nombreArea
          : 'Sin área';

      conteoPorArea[nombreArea] = (conteoPorArea[nombreArea] || 0) + 1;
    });

    const labels = Object.keys(conteoPorArea);
    const data = Object.values(conteoPorArea);

    const ctx = (
      document.getElementById('graficoArea') as HTMLCanvasElement
    )?.getContext('2d');

    if (ctx) {
      this.graficoArea = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Cantidad de Incapacidades por Área',
              data,
              backgroundColor: labels.map(() => this.generarColorAleatorio()),
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }
  }

  get totalPages(): number[] {
    const filtro = this.filtroNombre?.toLowerCase() || '';
    const filtradas = this.incapacidades.filter((i) => {
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

  get paginadas(): Incapacidad[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.incapacidadesFiltradas.slice(start, start + this.itemsPerPage);
  }
  cargarIncapacidades(): void {
    this.incapacidadService.obtenerTodas().subscribe({
      next: (res: Incapacidad[]) => {
         // debe mostrar el array
        this.incapacidades = res || [];
      },
      error: (err) => console.error('Error al cargar incapacidades', err),
    });
  }

  eliminarIncapacidad(id: number): void {
    this.incapacidadService.eliminar(id).subscribe({
      next: () => {
        this.incapacidades = this.incapacidades.filter(
          (i) => i.idIncapacidad !== id
        );
        // si usas paginador dinámico
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La incapacidad ha sido eliminada correctamente.',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error('Error al eliminar la incapacidad', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al eliminar la incapacidad.',
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
      text: 'Esta acción eliminará la incapacidad de .' + nombre + '.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarIncapacidad(id);
      }
    });
  }
  descargarPDFPorEstado() {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

    imgLogo.onload = () => {
      doc.setFillColor(4, 26, 43);
      doc.rect(0, 0, 210, 30, 'F');
      doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
      doc.setFontSize(16);
      doc.setTextColor(200);
      doc.text('ManageHR - Reporte de Incapacidades por Estado', 35, 15);

      let startY = 35;

      const canvas: any = document.getElementById('graficoEstado');
      if (canvas) {
        const imgData = canvas.toDataURL('image/png', 1.0);
        doc.addImage(imgData, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      const estados = ['Pendiente', 'Aceptado', 'Rechazado'];

      estados.forEach((estadoTexto, estadoIndex) => {
        const lista = this.incapacidades.filter(
          (i) => i.estado === estadoIndex
        );
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Estado: ${estadoTexto}`, 10, startY);

        const body = lista.map((inc: any) => {
          const u = inc.contrato?.hoja_de_vida?.usuario || {};
          const nombre = `${u.primerNombre || ''} ${
            u.primerApellido || ''
          }`.trim();
          return [
            u.numDocumento || 'N/A',
            nombre,
            inc.fechaInicio,
            inc.fechaFinal,
            inc.archivo ? 'Sí' : 'No',
          ];
        });

        autoTable(doc, {
          head: [
            [
              'Documento',
              'Nombre Usuario',
              'Fecha Inicio',
              'Fecha Final',
              'Archivo',
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

      doc.save('reporte_incapacidades_por_estado.pdf');
    };
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
      doc.text('ManageHR - Reporte de Incapacidades por Usuario', 35, 15);

      let startY = 35;

      // Insertar gráfica si existe el canvas
      const canvas: any = document.getElementById('graficoUsuario');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      // Agrupar incapacidades por usuario (nombre completo)
      const agrupadoPorUsuario = this.incapacidadesFiltradas.reduce(
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

      // Para cada usuario generar tabla con incapacidades
      Object.entries(agrupadoPorUsuario).forEach(([usuario, lista]: any) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Usuario: ${usuario}`, 10, startY);

        const body = lista.map((inc: any) => {
          return [
            inc.fechaInicio || 'N/A',
            inc.fechaFinal || 'N/A',
            inc.archivo ? 'Sí' : 'No',
          ];
        });

        autoTable(doc, {
          head: [['Fecha Inicio', 'Fecha Final', 'Archivo']],
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

      doc.save('incapacidades_por_usuario.pdf');
    };
  }
  descargarExcelPorEstado() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Incapacidades por Estado');

    const estados = ['Pendiente', 'Aceptado', 'Rechazado'];

    estados.forEach((estadoTexto, index) => {
      const lista = this.incapacidades.filter((i) => i.estado === index);

      const titulo = sheet.addRow([`Estado: ${estadoTexto}`]);
      titulo.font = { bold: true };
      sheet.mergeCells(`A${titulo.number}:F${titulo.number}`);

      const headers = sheet.addRow([
        'Documento',
        'Nombre Usuario',
        'Correo',
        'Fecha Inicio',
        'Fecha Final',
        'Archivo',
      ]);
      headers.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headers.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' },
      };

      lista.forEach((inc) => {
        const usuario = inc.contrato?.hoja_de_vida?.usuario;

        const nombre = usuario
          ? `${usuario.primerNombre} ${usuario.primerApellido}`
          : 'N/A';

        sheet.addRow([
          usuario?.numDocumento || 'N/A',
          nombre,
          usuario?.email || '',
          inc.fechaInicio,
          inc.fechaFinal,
          inc.archivo ? 'Sí' : 'No',
        ]);
      });

      sheet.addRow([]);
    });

    sheet.columns = [
      { key: 'doc', width: 15 },
      { key: 'nombre', width: 30 },
      { key: 'email', width: 25 },
      { key: 'inicio', width: 15 },
      { key: 'fin', width: 15 },
      { key: 'archivo', width: 10 },
    ];

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'reporte_incapacidades_por_estado.xlsx');
    });
  }

  descargarExcelPorUsuario() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Incapacidades por Usuario');

    // Agrupar incapacidades por usuario (usando documento como clave)
    const incapacidadesAgrupadas = this.incapacidadesFiltradas.reduce(
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
    Object.values(incapacidadesAgrupadas).forEach(
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
          'Correo',
          'Fecha Inicio',
          'Fecha Final',
          'Días',
          'Archivo',
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

        // Filas de datos por incapacidad
        registros.forEach((inc: any, index: number) => {
          const dias = this.calcularDias(inc.fechaInicio, inc.fechaFinal); // O calcula tú mismo la cantidad de días
          const row = sheet.addRow([
            usuario?.numDocumento || 'N/A',
            usuario?.email || 'N/A',
            inc.fechaInicio,
            inc.fechaFinal,
            dias,
            inc.archivo ? 'Sí' : 'No',
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
      saveAs(blob, 'incapacidades_por_usuario.xlsx');
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
      doc.text('ManageHR - Reporte de Incapacidades por Área', 35, 15);

      let startY = 35;

      // Insertar gráfica del canvas correcto
      const canvas: any = document.getElementById('graficoArea');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      const agrupadoPorArea = this.incapacidades.reduce(
        (acc: any, inc: any) => {
          const nombreArea = inc.contrato?.area?.nombreArea || 'Sin área';
          if (!acc[nombreArea]) acc[nombreArea] = [];
          acc[nombreArea].push(inc);
          return acc;
        },
        {}
      );

      Object.entries(agrupadoPorArea).forEach(([area, lista]: any) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Área: ${area}`, 10, startY);

        const body = lista.map((inc: any) => {
          const u = inc.contrato?.hoja_de_vida?.usuario || {};
          const nombreCompleto = `${u.primerNombre || ''} ${
            u.segundoNombre || ''
          } ${u.primerApellido || ''} ${u.segundoApellido || ''}`.trim();
          return [
            u.numDocumento || 'N/A',
            nombreCompleto || 'Sin nombre',
            inc.fechaInicio || 'N/A',
            inc.fechaFinal || 'N/A',
            inc.archivo ? 'Sí' : 'No',
          ];
        });

        autoTable(doc, {
          head: [
            [
              'Documento',
              'Nombre Usuario',
              'Fecha Inicio',
              'Fecha Final',
              'Archivo',
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
        this.incapacidades?.[0]?.contrato?.hoja_de_vida?.usuario
          ?.numDocumento || 'sin_documento';
      doc.save(`incapacidades_por_area_${numDocumento}.pdf`);
    };
  }

  descargarExcelPorArea() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Incapacidades por Área');

    const agrupadoPorArea = this.incapacidades.reduce((acc: any, inc: any) => {
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
        'Correo',
        'Fecha Inicio',
        'Fecha Final',
        'Días',
        'Archivo',
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
        const nombreCompleto = `${u.primerNombre || ''} ${
          u.segundoNombre || ''
        } ${u.primerApellido || ''} ${u.segundoApellido || ''}`.trim();
        const dias = this.calcularDias(inc.fechaInicio, inc.fechaFinal);

        const row = sheet.addRow([
          u.numDocumento || 'N/A',
          nombreCompleto || 'Sin nombre',
          u.email || 'N/A',
          inc.fechaInicio,
          inc.fechaFinal,
          dias,
          inc.archivo ? 'Sí' : 'No',
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
      this.incapacidades?.[0]?.contrato?.hoja_de_vida?.usuario?.numDocumento ||
      'sin_documento';
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `incapacidades_por_area_${numDocumento}.xlsx`);
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

    

    // Mostrar modal
    setTimeout(() => {
      const modalEl = document.getElementById('modalVerArchivo');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    }, 100);
  }

  abrirModalEstado(incapacidad: any) {
   
    this.incapacidadSeleccionada = incapacidad;
    this.nuevoEstado = incapacidad.estado ?? 0;
    
    const modal = new bootstrap.Modal(
      document.getElementById('modalCambiarEstado')!
    );
    modal.show();
  }

  actualizarEstado(): void {
    const id = this.incapacidadSeleccionada?.idIncapacidad;
    if (!id) {
      Swal.fire(
        'Error',
        'No se encontró la incapacidad seleccionada.',
        'error'
      );
      return;
    }

    this.incapacidadService.cambiarEstado(id, this.nuevoEstado).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Estado actualizado correctamente.', 'success').then(
          () => location.reload()
        );
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
      },
    });
  }

  getClaseEstado(estado: number): string {
    switch (estado) {
      case 0:
        return 'badge bg-warning text-dark';
      case 1:
        return 'badge bg-success';
      case 2:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getNombreEstado(estado: number): string {
    switch (estado) {
      case 0:
        return 'Pendiente';
      case 1:
        return 'Aceptado';
      case 2:
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  }
}
