import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { AuthInterceptor } from '../../interceptors/auth.interceptor';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Vacacion } from '../../services/vacaciones.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { AuthService } from 'src/app/services/auth.service';
import { FilterNamePipe } from 'src/app/shared/filter-name.pipe';
import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';
import { ChangeDetectorRef } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import autoTable, { CellInput, RowInput } from 'jspdf-autotable';

import jsPDF from 'jspdf';
import {ChartConfiguration, ChartType, registerables } from 'chart.js';
Chart.register(...registerables);
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
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

// Definimos la interfaz para los datos de vacaciones
interface Vacaciones {
  id: number;
  nombre: string;
  cargo: string;
  
  estado: 'Completado' | 'Rechazado' | 'Pendiente';
  fechaInicio: string;
  fechaFin: string;
  isExpanded?: boolean; // Propiedad para el estado del acordeón
}

// Definimos las columnas para usar como etiquetas en el acordeón
interface ColumnHeader {
    key: keyof Vacaciones| 'accion';
    label: string;
}


@Component({
  selector: 'app-vacaciones',
  templateUrl: './vacaciones.component.html',
  imports: [CommonModule,MenuComponent, FormsModule, NgxPaginationModule],
  styleUrls: ['./vacaciones.component.scss']
})
export class VacacionesComponent implements OnInit {
  usuario: any = {};
  vacaciones: Vacacion[] = [];
  vacacionSeleccionada: any = {
    nombre: '',
    cargo: '',
    estado: 'Pendiente',
    fechaInicio: '',
    fechaFin: ''
  };
  graficoEstado: any;
  graficoUsuario: any;
  graficoArea: any;
  modoEdicion: boolean = false;
  formVacacion: FormGroup;
  editando = false;
  vacacionSeleccionadaId: number | null = null;
  filtro: string = '';
  filtroNombre= '';
  currentPage = 1;
  itemsPerPage = 5;
  vacacionesPorPagina: number = 5;
  paginaActual: number =1;
  totalPages: number = 1;
  detalleVacacion: any = null;
  reporteActivo: 'estado' | 'usuario' | 'area' | null = null;
  chart: any;
  constructor(
    private vacacionesService: VacacionesService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.formVacacion = this.fb.group({
      fecha_inicio: [''],
      fecha_fin: [''],
      motivo: [''],
      user_id: ['']
    });
  }
  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
      
    }
    this.cargarVacaciones();
  }
  cargarVacaciones(): void {
    this.vacacionesService.getVacaciones().subscribe({
      next: (data) => {
        this.vacaciones = data; 
        this.totalPages = Math.ceil(this.vacaciones.length / this.itemsPerPage);
      },
      error: (err) => {
        console.error('Error al cargar vacaciones', err);
      }
    });
  }

  vacacionesFiltradas(): Vacacion[] {
    const filtro = this.filtroNombre.toLowerCase();
    return this.vacaciones.filter(v => {
      const nombreCompleto = `${v.contrato.hoja_de_vida.usuario.primerNombre} ${v.contrato.hoja_de_vida.usuario.primerApellido}`.toLowerCase();
      const documento = v.contrato.hoja_de_vida.usuario.numDocumento.toString();
      const area = v.contrato.area.nombreArea.toLowerCase();

      return (
        nombreCompleto.includes(filtro) ||
        documento.includes(filtro) ||
        area.includes(filtro)
      );
    });
  }

  get vacacionesFiltradasPaginadas(): Vacacion[] {
    const filtradas = this.vacacionesFiltradas();
    this.totalPages = Math.ceil(filtradas.length / this.itemsPerPage);
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return filtradas.slice(inicio, fin);
  }


    
    verDetalle(vacacion: Vacacion) {
      this.vacacionSeleccionada = { ...vacacion };
      const modal = new bootstrap.Modal(document.getElementById('detalleModal')!);
      modal.show();
    }

    actualizarEstado(): void {
      if (!this.vacacionSeleccionada) return;

      this.vacacionesService.actualizarVacacion(
        this.vacacionSeleccionada.idVacaciones,
        this.vacacionSeleccionada
      ).subscribe({
        next: () => {
          this.cargarVacaciones();
          const modal = bootstrap.Modal.getInstance(document.getElementById('editarEstadoModal')!);
          modal?.hide();

          Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: 'El estado de la vacación fue actualizado correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (error) => {
          console.error('Error al actualizar estado:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el estado. Intenta nuevamente.',
          });
        }
      });
    }

    
    
    confirmDelete(id: number): void {
      Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.vacacionesService.eliminarVacacion(id).subscribe({
            next: () => {
              Swal.fire('Eliminado', 'Registro eliminado con éxito.', 'success');
              this.cargarVacaciones();
            },
            error: () => {
              Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
            }
          });
        }
      });
    }
  
    
    cambiarPagina(pagina: number): void {
      if (pagina >= 1 && pagina <= this.itemsPerPage) {
        this.currentPage = pagina;
      }
    }
   

    esNumero(pagina: number | string): boolean {
      return typeof pagina === 'number';
    }
    cambiarPaginaSiEsNumero(pagina: number | string): void {
      if (typeof pagina === 'number' && pagina !== this.currentPage) {
        this.currentPage = pagina;
      }
    }



    getPaginas(): (number | string)[] {
      const total = this.totalPages;
      const current = this.currentPage;
      const pages: (number | string)[] = [];

      if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);

        if (current > 3) pages.push('...');

        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);

        if (current < total - 2) pages.push('...');

        pages.push(total);
      }

      return pages;
    }
    verDetalles(id: number): void {
      
      this.vacacionesService.getVacacionPorId(id).subscribe({
        next: (resp) => {
          this.detalleVacacion = resp.vacaciones;
          const modal = new bootstrap.Modal(document.getElementById('verDetallesModal')!);
          modal.show();
        },
        error: (err) => {
          console.error('Error al obtener detalles:', err);
        }
      });
    }
    editarEstado(id: number): void {
      this.vacacionesService.getVacacionPorId(id).subscribe({
        next: (response) => {
          this.vacacionSeleccionada = response.vacaciones;

          // Abre el modal de edición
          const modal = new bootstrap.Modal(document.getElementById('editarEstadoModal')!);
          modal.show();
        },
        error: (err) => {
          console.error('Error al cargar vacación', err);
          Swal.fire('Error', 'No se pudo cargar la información de la vacación.', 'error');
        }
      });
    }

    abrirModalEstado() {
      setTimeout(() => this.generarGraficoEstado(), 300);
      const modal = new bootstrap.Modal(document.getElementById('modalReporteEstado')!);
      modal.show();
    }

    abrirModalUsuario() {
      setTimeout(() => this.generarGraficoUsuario(), 300);
      const modal = new bootstrap.Modal(document.getElementById('modalReporteUsuario')!);
      modal.show();
    }

    abrirModalArea() {
      setTimeout(() => this.generarGraficoArea(), 300);
      const modal = new bootstrap.Modal(document.getElementById('modalReporteArea')!);
      modal.show();
    }


  obtenerDatosReporte() {
    if (this.reporteActivo === 'estado') {
      return this.vacaciones.reduce((acc: any, vac: any) => {
        acc[vac.estado] = (acc[vac.estado] || 0) + 1;
        return acc;
      }, {});
    } else if (this.reporteActivo === 'usuario') {
      return this.vacaciones.reduce((acc: any, vac: any) => {
        const nombre = vac.contrato?.hoja_de_vida?.usuario?.primerNombre + ' ' + vac.contrato?.hoja_de_vida?.usuario?.primerApellido;
        acc[nombre] = (acc[nombre] || 0) + 1;
        return acc;
      }, {});
    } else if (this.reporteActivo === 'area') {
      return this.vacaciones.reduce((acc: any, vac: any) => {
        const area = vac.contrato?.area?.nombreArea;
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {});
    }
    return {};
  }

  generarGraficoEstado(): void {
    const estadosMap = new Map<string, number>();
    this.vacaciones.forEach(v => {
      const estado = v.estado;
      estadosMap.set(estado, (estadosMap.get(estado) || 0) + 1);
    });

    const labels = Array.from(estadosMap.keys());
    const data = Array.from(estadosMap.values());

    // Colores personalizados por estado
    const coloresPorEstado: { [key: string]: string } = {
      'Aprobado': '#1cc88a',   // Verde
      'Pendiente': '#f6c23e',  // Amarillo
      'Rechazado': '#e74a3b'   // Rojo
    };

    const backgroundColors = labels.map(estado => coloresPorEstado[estado] || '#858796'); // Gris por defecto

    const ctx = document.getElementById('graficoEstado') as HTMLCanvasElement;
    if (this.graficoEstado) this.graficoEstado.destroy();

    this.graficoEstado = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Vacaciones por Estado',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Vacaciones por Estado'
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }


  generarGraficoUsuario(): void {
    const usuarioMap = new Map<string, number>();
    this.vacaciones.forEach(v => {
      const usuario = v.contrato?.hoja_de_vida?.usuario;
      if (usuario) {
        const nombre = `${usuario.primerNombre} ${usuario.primerApellido}`;
        usuarioMap.set(nombre, (usuarioMap.get(nombre) || 0) + 1);
      }
    });

    const labels = Array.from(usuarioMap.keys());
    const data = Array.from(usuarioMap.values());

    // Generar una paleta de colores aleatorios
    const backgroundColors = labels.map(() => this.generarColorAleatorio());

    const ctx = document.getElementById('graficoUsuario') as HTMLCanvasElement;
    if (this.graficoUsuario) this.graficoUsuario.destroy();

    this.graficoUsuario = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Vacaciones por Usuario',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Vacaciones por Usuario'
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
  generarGraficoArea(): void {
    const areaMap = new Map<string, number>();
    this.vacaciones.forEach(v => {
      const area = v.contrato?.area?.nombreArea;
      if (area) areaMap.set(area, (areaMap.get(area) || 0) + 1);
    });

    const labels = Array.from(areaMap.keys());
    const data = Array.from(areaMap.values());

    const backgroundColors = labels.map(() => this.generarColorAleatorio());

    const ctx = document.getElementById('graficoArea') as HTMLCanvasElement;
    if (this.graficoArea) this.graficoArea.destroy();

    this.graficoArea = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Vacaciones por Área',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Vacaciones por Área'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }
  // Función auxiliar para generar colores aleatorios en formato HEX
  generarColorAleatorio(): string {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  descargarPDFPorEstado(): void {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

    imgLogo.onload = () => {
      doc.setFillColor(4, 26, 43);
      doc.rect(0, 0, 210, 30, 'F');
      doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
      doc.setFontSize(16);
      doc.setTextColor(200);
      doc.text('ManageHR - Reporte de Vacaciones por Estado', 35, 15);

      let startY = 35;

     
      const canvas: any = document.getElementById('graficoEstado');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      const agrupado = this.vacaciones.reduce((acc: any, v: any) => {
        const estado = v.estado || 'Sin estado';
        if (!acc[estado]) acc[estado] = [];
        acc[estado].push(v);
        return acc;
      }, {});

      Object.entries(agrupado).forEach(([estado, lista]: any) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Estado: ${estado}`, 10, startY);

        const body = lista.map((v: any) => {
          const u = v.contrato?.hoja_de_vida?.usuario || {};
          return [
            u.numDocumento || 'N/A',
            `${u.primerNombre || ''} ${u.primerApellido || ''}`,
            u.email || 'N/A',
          ];
        });

        autoTable(doc, {
          head: [['Documento', 'Nombre', 'Correo']],
          body,
          startY: startY + 5,
          theme: 'grid',
          styles: { halign: 'left', fontSize: 10 },
          didParseCell: (data) => {
            if (data.section === 'body' && data.row.index % 2 === 0) {
              data.cell.styles.fillColor = [240, 240, 240];
            }
          }
        });

        startY = (doc as any).lastAutoTable.finalY + 10;
      });

      doc.save('vacaciones_por_estado.pdf');
    };
  }

  descargarPDFPorUsuario(): void {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

    imgLogo.onload = () => {
      doc.setFillColor(4, 26, 43);
      doc.rect(0, 0, 210, 30, 'F');
      doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
      doc.setFontSize(16);
      doc.setTextColor(200);
      doc.text('ManageHR - Reporte de Vacaciones por Usuario', 35, 15);

      let startY = 35;

      // ✅ Corregido: el ID del canvas debe ser el mismo que el de tu gráfico de usuario
      const canvas: any = document.getElementById('graficoUsuario');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      const agrupado = this.vacaciones.reduce((acc: any, v: any) => {
        const usuario = v.contrato?.hoja_de_vida?.usuario;
        const docu = usuario?.numDocumento || 'N/A';
        if (!acc[docu]) acc[docu] = { usuario, registros: [] };
        acc[docu].registros.push(v);
        return acc;
      }, {});

      Object.values(agrupado).forEach((grupo: any) => {
        const u = grupo.usuario || {};
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Usuario: ${u.primerNombre || ''} ${u.primerApellido || ''}`, 10, startY);

        const body = grupo.registros.map((v: any) => [
          v.fechaInicio,
          v.fechaFinal,
          v.dias,
          v.estado,
        ]);

        autoTable(doc, {
          head: [['Fecha Inicio', 'Fecha Final', 'Días', 'Estado']],
          body,
          startY: startY + 5,
          theme: 'grid',
          styles: { halign: 'left', fontSize: 10 },
          headStyles: {
            fillColor: [4, 26, 43],
            textColor: 255
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.row.index % 2 === 0) {
              data.cell.styles.fillColor = [240, 240, 240];
            }
          }
        });

        startY = (doc as any).lastAutoTable.finalY + 10;
      });

      doc.save('vacaciones_por_usuario.pdf');
    };
  }

  descargarPDFPorArea(): void {
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
      doc.text('ManageHR - Reporte de Vacaciones por Área', 35, 15);

      let startY = 35;

      // ✅ Inserta la gráfica si existe el canvas
      const canvas: any = document.getElementById('graficoArea');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      // Agrupar por área
      const agrupado = this.vacaciones.reduce((acc: any, v: any) => {
        const area = v.contrato?.area?.nombreArea || 'Sin área';
        if (!acc[area]) acc[area] = [];
        acc[area].push(v);
        return acc;
      }, {});

      // Recorrer agrupado
      Object.entries(agrupado).forEach(([area, lista]: any) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Área: ${area}`, 10, startY);

        const body = lista.map((v: any) => {
          const u = v.contrato?.hoja_de_vida?.usuario || {};
          return [
            u.numDocumento || 'N/A',
            `${u.primerNombre || ''} ${u.primerApellido || ''}`,
            u.email || 'N/A',
            v.fechaInicio,
            v.fechaFinal,
          ];
        });

        autoTable(doc, {
          head: [['Documento', 'Nombre', 'Correo', 'Fecha Inicio', 'Fecha Final']],
          body,
          startY: startY + 5,
          theme: 'grid',
          styles: { halign: 'left', fontSize: 10 },
          headStyles: {
            fillColor: [4, 26, 43],
            textColor: 255
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.row.index % 2 === 0) {
              data.cell.styles.fillColor = [240, 240, 240];
            }
          }
        });

        startY = (doc as any).lastAutoTable.finalY + 10;
      });

      doc.save('vacaciones_por_area.pdf');
    };
  }


  descargarExcelPorEstado(): void {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Vacaciones por Estado');

    const vacacionesAgrupadas = this.vacaciones.reduce((acc: any, v: any) => {
      const estado = v.estado || 'Sin estado';
      if (!acc[estado]) acc[estado] = [];
      acc[estado].push(v);
      return acc;
    }, {});

    Object.entries(vacacionesAgrupadas).forEach(([estado, registros]: any) => {
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
        'Nombre',
        'Correo',
        'Fecha Inicio',
        'Fecha Final',
        'Días'
      ]);

      encabezadoRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      encabezadoRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' }, // Verde oscuro
      };

      encabezadoRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      registros.forEach((v: any, index: number) => {
        const usuario = v.contrato?.hoja_de_vida?.usuario;
        const row = sheet.addRow([
          usuario?.numDocumento || 'N/A',
          `${usuario?.primerNombre || ''} ${usuario?.primerApellido || ''}`,
          usuario?.email || 'N/A',
          v.fechaInicio,
          v.fechaFinal,
          v.dias
        ]);

        // Alternar color de fondo
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        }

        row.eachCell(cell => {
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

    // Ajustar ancho de columnas
    sheet.columns = [
      { key: 'documento', width: 20 },
      { key: 'nombre', width: 25 },
      { key: 'correo', width: 30 },
      { key: 'fechaInicio', width: 15 },
      { key: 'fechaFinal', width: 15 },
      { key: 'dias', width: 10 }
    ];

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'vacaciones_por_estado.xlsx');
    });
  }

  descargarExcelPorUsuario(): void {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Vacaciones por Usuario');

    const vacacionesAgrupadas = this.vacaciones.reduce((acc: any, v: any) => {
      const usuario = v.contrato?.hoja_de_vida?.usuario;
      const documento = usuario?.numDocumento || 'N/A';
      if (!acc[documento]) acc[documento] = { usuario, registros: [] };
      acc[documento].registros.push(v);
      return acc;
    }, {});

    Object.values(vacacionesAgrupadas).forEach(({ usuario, registros }: any) => {
      const tituloRow = sheet.addRow([`Usuario: ${usuario?.primerNombre || 'Sin nombre'} ${usuario?.primerApellido || ''}`]);
      tituloRow.font = { bold: true };
      tituloRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      sheet.mergeCells(`A${tituloRow.number}:F${tituloRow.number}`);

      const encabezadoRow = sheet.addRow([
        'Documento', 'Correo', 'Fecha Inicio', 'Fecha Final', 'Días', 'Estado'
      ]);
      encabezadoRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      encabezadoRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' }, // Verde institucional
      };

      encabezadoRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      registros.forEach((v: any, index: number) => {
        const row = sheet.addRow([
          usuario?.numDocumento || 'N/A',
          usuario?.email || 'N/A',
          v.fechaInicio,
          v.fechaFinal,
          v.dias,
          v.estado
        ]);

        // Color alterno en filas
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        }

        row.eachCell(cell => {
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

    // Ajustar ancho de columnas
    sheet.columns = [
      { key: 'documento', width: 20 },
      { key: 'correo', width: 30 },
      { key: 'fechaInicio', width: 15 },
      { key: 'fechaFinal', width: 15 },
      { key: 'dias', width: 10 },
      { key: 'estado', width: 15 }
    ];

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'vacaciones_por_usuario.xlsx');
    });
  }

  descargarExcelPorArea(): void {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Vacaciones por Área');

  const vacacionesAgrupadas = this.vacaciones.reduce((acc: any, v: any) => {
    const area = v.contrato?.area?.nombreArea || 'Sin área';
    if (!acc[area]) acc[area] = [];
    acc[area].push(v);
    return acc;
  }, {});

  Object.entries(vacacionesAgrupadas).forEach(([area, registros]: any) => {
    const tituloRow = sheet.addRow([`Área: ${area}`]);
    tituloRow.font = { bold: true };
    tituloRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' },
    };
    sheet.mergeCells(`A${tituloRow.number}:F${tituloRow.number}`);

    const encabezadoRow = sheet.addRow([
      'Documento', 'Nombre', 'Correo', 'Fecha Inicio', 'Fecha Final', 'Estado'
    ]);
    encabezadoRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    encabezadoRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E7D32' }, // Verde oscuro
    };

    encabezadoRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    registros.forEach((v: any, index: number) => {
      const usuario = v.contrato?.hoja_de_vida?.usuario;
      const row = sheet.addRow([
        usuario?.numDocumento || 'N/A',
        `${usuario?.primerNombre || ''} ${usuario?.primerApellido || ''}`,
        usuario?.email || 'N/A',
        v.fechaInicio,
        v.fechaFinal,
        v.estado
      ]);

      // Alternar fondo
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      row.eachCell(cell => {
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

  // Ajustar ancho de columnas
  sheet.columns = [
    { key: 'documento', width: 20 },
    { key: 'nombre', width: 25 },
    { key: 'correo', width: 30 },
    { key: 'fechaInicio', width: 15 },
    { key: 'fechaFinal', width: 15 },
    { key: 'estado', width: 15 }
  ];

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'vacaciones_por_area.xlsx');
  });
}




  
 

  
}

