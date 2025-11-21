import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Postulacion } from '../../../services/postulacionesadmin.service';
import { PostulacionesadminService } from '../../../services/postulacionesadmin.service';
import { AuthService } from '../../../services/auth.service';
import { MenuComponent } from '../../menu/menu.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgxPaginationModule } from 'ngx-pagination';
import { forkJoin } from 'rxjs';
import * as ExcelJS from 'exceljs';
import { ChangeDetectorRef } from '@angular/core';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
@Component({
  selector: 'app-postulaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent],
  templateUrl: './postulaciones.component.html',
  styleUrls: ['./postulaciones.component.scss']
})
export class PostulacionesComponent implements OnInit, OnDestroy {
  postulaciones: Postulacion[] = [];
  usuario: any = {};
  postulacionSeleccionada: Postulacion | null = null;

  filtroTerm = '';
 postulacionesPorVacante: any[] = [];
  postulacionesPorEstado: any[] = [];
  postulacionesPorEmpleado: any[] = [];
  chartVacantes: any;
  chartEstados: any;
  chartEmpleados: any;

  
  filtroPostulacion: string = '';
  paginaActual: number = 1;
  postulacionesPorPagina: number = 5;

  private searchTerms = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private postulacionesadminService: PostulacionesadminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
    }

    this.searchSubscription = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.filtrarPostulaciones(term));

    this.cargarPostulaciones();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerms.next(term);
  }
  

  cargarPostulaciones(): void {
    this.postulacionesadminService.getPostulaciones().subscribe({
      next: (data) => {
        this.postulaciones = data;
        this.filtroPostulacion = ''; 
        this.paginaActual = 1;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la lista de postulaciones', 'error');
      }
    });
  }

  filtrarPostulaciones(term: string): void {
    if (!term || isNaN(+term)) {
      this.cargarPostulaciones();
    } else {
      const vacanteId = +term;
      this.postulaciones = this.postulaciones.filter(p => p.vacantesId === vacanteId);
    }
  }

  editarPostulacion(postulacion: Postulacion): void {
    this.postulacionSeleccionada = { ...postulacion };
  }

  verDetalles(postulacion: Postulacion): void {
      this.postulacionSeleccionada = postulacion;
    }

  guardarEstadoPostulacion(): void {
    if (!this.postulacionSeleccionada) return;

    const estadoNumerico = Number(this.postulacionSeleccionada.estado); // cast de seguridad

    this.postulacionesadminService
      .actualizarEstado(this.postulacionSeleccionada.idPostulaciones, estadoNumerico)
      .subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'Estado actualizado correctamente', 'success');
          this.filtroPostulacion = '';
          this.cargarPostulaciones();
          this.postulacionSeleccionada = null;

          const modal = document.getElementById('editarEstadoModal');
          if (modal) {
            const instance = bootstrap.Modal.getInstance(modal);
            instance?.hide();

            
            setTimeout(() => {
              location.reload();
            }, 2000); 
          }

        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
        }
      });
  }


convertirNumeroAEstado(estado: number): string {
  switch (estado) {
    case 1: return 'Aceptado';
    case 2: return 'Pendiente';
    case 3: return 'Rechazado';
    default: return 'Pendiente';
  }
}

obtenerNombreEstado(estado: number): string {
  
  switch (estado) {
    case 1: return 'Aceptado';
    case 2: return 'Pendiente';
    case 3: return 'Rechazado';
    default: return 'Desconocido';
  }
}




  
  get postulacionesFiltradas(): Postulacion[] {
    const filtro = this.filtroPostulacion.toLowerCase();
    return this.postulaciones.filter(p =>
      p.numDocumento.toString().includes(filtro) ||
      p.vacante?.nomVacante.toLowerCase().includes(filtro) ||
      p.usuario?.primerNombre.toLowerCase().includes(filtro) ||
      p.usuario?.primerApellido.toLowerCase().includes(filtro)
    );
  }

  get postulacionesFiltradasPaginadas(): Postulacion[] {
    const inicio = (this.paginaActual - 1) * this.postulacionesPorPagina;
    return this.postulacionesFiltradas.slice(inicio, inicio + this.postulacionesPorPagina);
  }

  get totalPages(): number {
    return Math.ceil(this.postulacionesFiltradas.length / this.postulacionesPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.paginaActual = pagina;
    }
  }

  paginasParaMostrar(): number[] {
    const total = this.totalPages;
    const actual = this.paginaActual;
    const paginas: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) paginas.push(i);
    } else {
      paginas.push(1);
      if (actual > 3) paginas.push(-1); // representa "..."

      const start = Math.max(2, actual - 1);
      const end = Math.min(total - 1, actual + 1);
      for (let i = start; i <= end; i++) paginas.push(i);

      if (actual < total - 2) paginas.push(-1); // representa "..."
      paginas.push(total);
    }

    return paginas;
  }
  generarGraficoVacantes(): void {
    this.postulacionesadminService.getReportePorVacante().subscribe((res) => {
      this.postulacionesPorVacante = res.data;

      const labels = this.postulacionesPorVacante.map(p => p.nombreVacante);
      const data = this.postulacionesPorVacante.map(p => p.totalPostulantes);

      const colores = this.postulacionesPorVacante.map(() =>
        '#' + Math.floor(Math.random() * 16777215).toString(16)
      ); // genera colores hex aleatorios

      if (this.chartVacantes) this.chartVacantes.destroy();

      this.chartVacantes = new Chart('graficoVacantes', {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Postulantes por Vacante',
            data,
            backgroundColor: colores, // cada barra con color distinto
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Postulaciones por Vacante' }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }
  generarGraficoPorEstado(): void {
    this.postulacionesadminService.getReportePorEstado().subscribe((res) => {
      this.postulacionesPorEstado = res.data;

      const labels = this.postulacionesPorEstado.map(p => `Estado ${p.estado}`);
      const data = this.postulacionesPorEstado.map(p => p.total);

      if (this.chartEstados) this.chartEstados.destroy();

      this.chartEstados = new Chart('graficoEstados', {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Postulaciones por Estado',
            data,
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Postulaciones por Estado' }
          }
        }
      });
    });
  }

  generarGraficoInternos(): void {
    this.postulacionesadminService.getReporteInternos().subscribe((res) => {
      this.postulacionesPorEmpleado = res.data;

      // Aseguramos que haya al menos una entrada
      const postulantes = this.postulacionesPorEmpleado[0]?.postulantes || [];

      // Agrupar por nombre de vacante
      const conteoPorVacante: { [vacante: string]: number } = {};
      postulantes.forEach((p: any) => {
        const vacante = p.vacante || 'Sin nombre';
        conteoPorVacante[vacante] = (conteoPorVacante[vacante] || 0) + 1;
      });

      const labels = Object.keys(conteoPorVacante);
      const data = Object.values(conteoPorVacante);
      const colores = labels.map(() => '#' + Math.floor(Math.random() * 16777215).toString(16));

      if (this.chartEmpleados) this.chartEmpleados.destroy();

      this.chartEmpleados = new Chart('graficoInternos', {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Postulantes Internos por Vacante',
            data,
            backgroundColor: colores,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Postulaciones Internas por Vacante' }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }


  descargarExcelVacantes(): void {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Postulaciones por Vacante');

    sheet.addRow([]); // Espacio inicial

    this.postulacionesPorVacante.forEach((vacanteData, index) => {
      const nombreVacante = vacanteData.nombreVacante || 'No especificado';

      // Fila de título por vacante
      const vacanteRow = sheet.addRow([`Vacante: ${nombreVacante}`]);
      vacanteRow.font = { bold: true };
      vacanteRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' }, // gris claro
      };
      sheet.mergeCells(`A${vacanteRow.number}:C${vacanteRow.number}`);

      // Fila de encabezado
      const encabezadoRow = sheet.addRow(['Documento', 'Nombre']);
      encabezadoRow.font = { bold: true };
      encabezadoRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB0C4DE' }, // azul claro
      };

      encabezadoRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Filas de postulantes
      vacanteData.postulantes.forEach((p: any, i: number) => {
        const dataRow = sheet.addRow([p.documento, p.nombre, p.correo]);

        if (i % 2 === 0) {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF7F7F7' }, // gris muy claro para alternar
          };
        }

        dataRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // Línea vacía entre vacantes
      sheet.addRow([]);
    });

    // Ajuste de columnas
    sheet.columns = [
      { key: 'documento', width: 20 },
      { key: 'nombre', width: 30 },
      { key: 'correo', width: 30 }
    ];

    // Descargar archivo
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'postulaciones_por_vacante.xlsx');
    });
  }
  descargarExcelPorEstado(): void {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Postulaciones por Estado');

    sheet.addRow([]);

    this.postulacionesPorEstado.forEach((estadoObj) => {
      const estadoRow = sheet.addRow([`Estado: ${estadoObj.estado}`]);
      estadoRow.font = { bold: true };
      estadoRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      sheet.mergeCells(`A${estadoRow.number}:C${estadoRow.number}`);

      const encabezadoRow = sheet.addRow(['Documento', 'Nombre', 'Correo']);
      encabezadoRow.font = { bold: true };
      encabezadoRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB0C4DE' },
      };

      encabezadoRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      estadoObj.postulantes.forEach((p: any, index: number) => {
        const dataRow = sheet.addRow([
          p.documento,
          p.nombre,
          p.correo
        ]);

        if (index % 2 === 0) {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF7F7F7' },
          };
        }

        dataRow.eachCell((cell) => {
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

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'postulaciones_por_estado.xlsx');
    });
  }
  descargarExcelInternos(): void {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Postulaciones Internas por Vacante');

  
    const postulantes = this.postulacionesPorEmpleado[0]?.postulantes || [];

   
    const vacantesMap = new Map<string, any[]>();
    postulantes.forEach((p: any) => {
      const vacante = p.vacante || 'Sin nombre';
      if (!vacantesMap.has(vacante)) vacantesMap.set(vacante, []);
      vacantesMap.get(vacante)!.push(p);
    });


    sheet.addRow([]);

    vacantesMap.forEach((postulantes, vacante) => {
      const tituloRow = sheet.addRow([`Vacante: ${vacante}`]);
      tituloRow.font = { bold: true };
      tituloRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      sheet.mergeCells(`A${tituloRow.number}:C${tituloRow.number}`);

      const encabezadoRow = sheet.addRow(['Documento', 'Nombre', 'Correo']);
      encabezadoRow.font = { bold: true };
      encabezadoRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB0C4DE' },
      };

      encabezadoRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      postulantes.forEach((p, i) => {
        const row = sheet.addRow([p.documento, p.nombre, p.correo]);

        if (i % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF7F7F7' },
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

    sheet.columns = [
      { key: 'documento', width: 20 },
      { key: 'nombre', width: 30 },
      { key: 'correo', width: 30 }
    ];

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'postulaciones_internas_por_vacante.xlsx');
    });
  }


  descargarPDFVacantes(): void {
    const doc = new jsPDF();

    const imgLogo = new Image();
    imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

    imgLogo.onload = () => {
      // Encabezado con color y logo
      doc.setFillColor(4, 26, 43);
      doc.rect(0, 0, 210, 30, 'F');
      doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
      doc.setFontSize(16);
      doc.setTextColor(255);
      doc.text('ManageHR - Reporte de Postulaciones', 35, 18);

      let startY = 40;

      // Gráfico
      const canvas: any = document.getElementById('graficoVacantes');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      // Tabla de datos
      const body: any[] = [];
      this.postulacionesPorVacante.forEach((p: any) => {
        body.push([
          p.nombreVacante || 'No especificado',
          p.totalPostulantes,
          p.postulantes.map((u: any) => `${u.nombre} (${u.documento})`).join('\n')
        ]);
      });

      autoTable(doc, {
        head: [['Vacante', 'Total Postulantes', 'Postulantes']],
        body,
        startY,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [4, 26, 43],
          textColor: 255
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [245, 245, 245];
          }
        }
      });

      doc.save('postulaciones_por_vacante.pdf');
    };
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
      doc.text('ManageHR - Reporte de Postulaciones por Estado', 35, 15);

      let startY = 35;

      const canvas: any = document.getElementById('graficoEstados');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      this.postulacionesPorEstado.forEach((estadoObj) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Estado: ${estadoObj.estado}`, 10, startY);

        const body = estadoObj.postulantes.map((p: any) => [
          p.documento,
          p.nombre,
          p.correo,
        ]);

        autoTable(doc, {
          head: [['Documento', 'Nombre', 'Correo']],
          body,
          startY: startY + 5,
          theme: 'grid',
          styles: {
            halign: 'left',
            fontSize: 10
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.row.index % 2 === 0) {
              data.cell.styles.fillColor = [240, 240, 240];
            }
          }
        });

        startY = (doc as any).lastAutoTable.finalY + 10;
      });

      doc.save('postulaciones_por_estado.pdf');
    };
  }
  descargarPDFInternos(): void {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

    imgLogo.onload = () => {
      doc.setFillColor(4, 26, 43);
      doc.rect(0, 0, 210, 30, 'F');
      doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
      doc.setFontSize(16);
      doc.setTextColor(255);
      doc.text('ManageHR - Postulaciones Internas por Vacante', 35, 18);

      let startY = 40;

      // Gráfico
      const canvas: any = document.getElementById('graficoInternos');
      if (canvas) {
        const graficoImg = canvas.toDataURL('image/png', 1.0);
        doc.addImage(graficoImg, 'PNG', 10, startY, 180, 80);
        startY += 90;
      }

      const postulantes = this.postulacionesPorEmpleado[0]?.postulantes || [];

      // Agrupar por vacante
      const vacantesMap = new Map<string, any[]>();
      postulantes.forEach((p: any) => {
      const vacante = p.vacante || 'Sin nombre';
        if (!vacantesMap.has(vacante)) vacantesMap.set(vacante, []);
        vacantesMap.get(vacante)!.push(p);
      });


      // Recorrer por vacante
      vacantesMap.forEach((postulantes, vacante) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Vacante: ${vacante}`, 10, startY);

        const body = postulantes.map(p => [
          p.documento,
          p.nombre,
          p.correo
        ]);

        autoTable(doc, {
          head: [['Documento', 'Nombre', 'Correo']],
          body,
          startY: startY + 5,
          theme: 'grid',
          styles: {
            fontSize: 10,
            halign: 'left',
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.row.index % 2 === 0) {
              data.cell.styles.fillColor = [245, 245, 245];
            }
          }
        });

        startY = (doc as any).lastAutoTable.finalY + 10;
      });

      doc.save('postulaciones_internas_por_vacante.pdf');
    };
  }


  abrirModalReportePostulaciones(): void {
    const modal = document.getElementById('modalReportePostulaciones');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();

      // Llamar aquí el método que genera la gráfica:
      this.generarGraficoVacantes();
    }
  }
  abrirModalReporteEstado(): void {
    const modal = document.getElementById('modalReporteEstado');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();

      // Llamar aquí el método que genera la gráfica:
      this.generarGraficoPorEstado();
    }
  }

  abrirModalReporteInternos(): void {
    const modal = document.getElementById('modalReporteInternos');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
      this.generarGraficoInternos();
    }
  }



}
