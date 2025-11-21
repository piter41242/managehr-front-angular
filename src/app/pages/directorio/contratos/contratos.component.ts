import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ContratosService,
  Contratos,
} from '../../../services/contratos.service';
import { UsuariosService, Usuarios } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { MenuComponent } from '../../menu/menu.component';
import Swal from 'sweetalert2';
import { Route } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterNombre } from './filter-nombre';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';

declare var bootstrap: any;

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenuComponent,
    NgxPaginationModule,
    FilterNombre,
  ],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss'],
})
export class ContratosComponent implements OnInit {
  contratos: Contratos[] = [];
  filtroNombre: string = '';
  currentPage = 1;
  itemsPerPage = 5;
  nacionalidades: any[] = [];
  tipoContratoId: any[] = [];
  numDocumento: any[] = [];
  totalPages = 1;
  archivoSeleccionado: File | null = null;
  tiposContrato: any[] = [];
  areas: any[] = [];
  contratoSeleccionado: Contratos = {
    idContrato: 0,
    tipoContratoId: 1,
    estado: 1,
    fechaIngreso: '',
    fechaFinalizacion: '',
    archivo: '',
    cargoArea: 1, // <-- agrega esta línea

    area: {
      idArea: 0,
      nombreArea: '',
    },
    hoja_de_vida: {
      idHojaDeVida: 0,
      usuarioNumDocumento: 0,
      usuario: {
        idUsuario: 0,
        numDocumento: 0,
        primerNombre: '',
        primerApellido: '',
      },
    },
    tipo_contrato: {
      idTipoContrato: 0,
      nomTipoContrato: '',
    },
  };

  reporteContratos: any[] = [];
  graficoContratos: any;
  paginasVisibles: number[] = [];
  contrato: any = {}; // contrato logueado desde localStorage
  usuario: any = {};
  nuevocontrato: any = {};

  constructor(
    private contratosService: ContratosService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
    }

    this.contratosService.obtenerContratos().subscribe({
      next: (data) => {
        this.contratos = data;
        this.totalPages = Math.ceil(this.contratos.length / this.itemsPerPage);
      },
      error: (err) => {
        console.error('Error al obtener contratos:', err);
      },
    });
    this.contratosService.obtenerAreas().subscribe({
      next: (res) => {
        this.areas = res;
      },
      error: () =>
        Swal.fire('Error', 'No se pudieron cargar las áreas', 'error'),
    });

    this.obtenerTiposContrato();
  }
  get totalItemsFiltrados(): number {
    return this.filtroNombre.length;
  }
  ngDoCheck(): void {
    this.actualizarPaginacion();
  }
  cargoNombre(cargoAreaId?: number): string {
    const cargos: { [key: number]: string } = {
      1: 'Empleado',
      2: 'Jefe de personal',
      3: 'Coordinador',
      4: 'Director',
    };
    return cargos[cargoAreaId ?? 0] || 'Desconocido';
  }

  obtenerTiposContrato(): void {
    this.contratosService.obtenerTiposContrato().subscribe({
      next: (data) => {
        this.tiposContrato = data;
      },
      error: (error) => {
        console.error('Error al cargar tipos de documento', error);
      },
    });
  }

  onFileSelected(event: any): void {
    this.archivoSeleccionado = event.target.files[0];
  }

  cargarContratos(): void {
    this.contratosService.obtenerContratos().subscribe({
      next: (data) => {
        this.contratos = data;
      },
      error: (err) => {
        console.error('Error al cargar contratos', err);
      },
    });
  }

  editarContrato(contrato: any, i: number) {
    this.contratoSeleccionado = { ...contrato };
  }

  confirmDelete(idContrato: number): void {
    // Buscar el contrato en el array
    const contrato = this.contratos.find((c) => c.idContrato === idContrato);

    if (!contrato) {
      Swal.fire('Error', 'Contrato no encontrado.', 'error');
      return;
    }

    if (!contrato.hoja_de_vida || !contrato.hoja_de_vida.usuario) {
      Swal.fire('Error', 'No se encontró información del usuario.', 'error');
      return;
    }

    const nombre = `${contrato.hoja_de_vida.usuario.primerNombre} ${contrato.hoja_de_vida.usuario.primerApellido}`;

    Swal.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.contratosService.eliminarContrato(idContrato).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: `${nombre} fue eliminado correctamente.`,
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              this.cargarContratos(); // O refresca solo la lista
            });
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire('Error', 'No se pudo eliminar el contrato.', 'error');
          },
        });
      }
    });
  }

  get contratosPaginados(): Contratos[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.contratosFiltrados.slice(start, start + this.itemsPerPage);
  }

  agregarContrato(): void {
    // Validar antes de enviar
    if (
      !this.contratoSeleccionado.hoja_de_vida.usuarioNumDocumento ||
      !this.contratoSeleccionado.tipoContratoId
    ) {
      Swal.fire('Error', 'Faltan datos obligatorios', 'error');
      return;
    }

    const formData = new FormData();
    formData.append(
      'numDocumento',
      this.contratoSeleccionado.hoja_de_vida.usuarioNumDocumento.toString()
    );
    formData.append(
      'tipoContratoId',
      this.contratoSeleccionado.tipoContratoId.toString()
    );
    formData.append('estado', this.contratoSeleccionado.estado.toString());
    formData.append('fechaIngreso', this.contratoSeleccionado.fechaIngreso);
    formData.append(
      'fechaFinalizacion',
      this.contratoSeleccionado.fechaFinalizacion
    );
    formData.append('area', this.contratoSeleccionado.area.idArea.toString());
    formData.append(
      'cargoArea',
      this.contratoSeleccionado.cargoArea?.toString() || '1'
    );

    if (this.archivoSeleccionado) {
      formData.append('archivo', this.archivoSeleccionado);
    } else {
      Swal.fire('Error', 'Debe adjuntar un archivo', 'error');
      return;
    }

    this.contratosService.agregarContrato(formData).subscribe({
      next: (res) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'El contrato fue creado exitosamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          this.cargarContratos();
        });
      },
      error: (err) => {
        console.error('Error al crear contrato:', err);
        Swal.fire(
          'Error',
          'No se pudo crear el contrato. Verifique los datos.',
          'error'
        );
      },
    });
  }

  imagenSeleccionada: string = '';
  abrirModalImagen(url: string | null) {
    if (!url) {
      console.warn('No hay archivo para mostrar');
      Swal.fire(
        'Advertencia',
        'No hay documento asociado para mostrar.',
        'warning'
      );
      return;
    }

    this.imagenSeleccionada = 'http://localhost:8000/' + url;
    setTimeout(() => {
      const modalElement = document.getElementById('modalImagen');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.error('Modal no encontrado en el DOM');
      }
    }, 200);
  }

  actualizarContrato(): void {
    const formData = new FormData();
    formData.append('_method', 'PATCH');
    formData.append(
      'numDocumento',
      this.contratoSeleccionado.hoja_de_vida.usuario.numDocumento.toString()
    );
    formData.append(
      'tipoContratoId',
      this.contratoSeleccionado.tipoContratoId.toString()
    );
    formData.append('estado', this.contratoSeleccionado.estado.toString());
    formData.append('fechaIngreso', this.contratoSeleccionado.fechaIngreso);
    formData.append(
      'fechaFinalizacion',
      this.contratoSeleccionado.fechaFinalizacion
    );
    formData.append('area', this.contratoSeleccionado.area.idArea.toString());
    formData.append(
      'cargoArea',
      this.contratoSeleccionado.cargoArea?.toString() || '1'
    );

    if (this.archivoSeleccionado) {
      formData.append('archivo', this.archivoSeleccionado);
    }

    console.log(
      'ID que se está enviando:',
      this.contratoSeleccionado.idContrato
    );

    this.contratosService
      .actualizarContratoParcial(this.contratoSeleccionado.idContrato, formData)
      .subscribe({
        next: (res) => {
          Swal.fire({
            title: '¡Actualizado!',
            text: 'El contrato fue editado exitosamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            location.reload();
          });

          const index = this.contratos.findIndex(
            (c) =>
              c.hoja_de_vida.usuario.idUsuario ===
              this.contratoSeleccionado.hoja_de_vida.usuario.idUsuario
          );
          if (index !== -1) {
            this.contratos[index] = { ...this.contratoSeleccionado };
          }
        },
        error: (err) => {
          console.error('Error al actualizar contrato:', err);
          Swal.fire({
            title: '¡Error!',
            text: 'Algo salió mal, no se pudo actualizar.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            location.reload();
          });
        },
      });
  }

  abrirModalAgregar(): void {
    this.nuevocontrato = {
      numDocumento: '',
      tipoContratoId: '',
      estado: '',
      fechaIngreso: '',
      fechaFinal: '',
      documento: '',
      area: { idArea: 0, nombreArea: '' },
    };
  }

  getNombreTipoContrato(tipoContratoId: number): string {
    const tipo = this.tiposContrato.find(
      (t) => t.idTipoContrato === tipoContratoId
    );
    return tipo ? tipo.nomTipoContrato : 'Desconocido';
  }

  getNombreEstado(estado: number): string {
    switch (estado) {
      case 1:
        return 'Activo';
      case 2:
        return 'Bloqueado';
      case 3:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  getClaseEstado(estado: number): string {
    switch (estado) {
      case 1:
        return 'badge bg-success';
      case 2:
        return 'badge bg-warning text-dark';
      case 3:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  get contratosFiltrados(): Contratos[] {
    if (!this.filtroNombre.trim()) return this.contratos;
    const filtro = this.filtroNombre.toLowerCase();
    return this.contratos.filter((c) => {
      const nombreUsuario =
        `${c.hoja_de_vida.usuario.primerNombre} ${c.hoja_de_vida.usuario.primerApellido}`.toLowerCase();
      return nombreUsuario.includes(filtro);
    });
  }
  esImagen(archivo: string): boolean {
    return archivo.match(/\.(jpg|jpeg|png|gif)$/i) !== null;
  }

  esPDF(archivo: string): boolean {
    return archivo.match(/\.pdf$/i) !== null;
  }

  esExcel(archivo: string): boolean {
    return archivo.match(/\.(xls|xlsx)$/i) !== null;
  }

  esOtro(archivo: string): boolean {
    return (
      !this.esImagen(archivo) && !this.esPDF(archivo) && !this.esExcel(archivo)
    );
  }
  coincideFiltro(contrato: any): boolean {
    const filtro = this.filtroNombre?.toLowerCase() || '';

    return (
      contrato?.hoja_de_vida?.usuario?.primerNombre
        ?.toLowerCase()
        .includes(filtro) ||
      contrato?.hoja_de_vida?.usuario?.primerApellido
        ?.toLowerCase()
        .includes(filtro) ||
      contrato?.hoja_de_vida?.usuarioNumDocumento
        ?.toString()
        .includes(filtro) ||
      contrato?.area?.nombreArea?.toLowerCase().includes(filtro) ||
      this.cargoNombre(contrato.cargoArea)?.toLowerCase().includes(filtro)
    );
  }

  actualizarPaginacion(): void {
    const contratosFiltrados = this.contratos.filter((contrato) =>
      this.coincideFiltro(contrato)
    );

    this.totalPages = Math.ceil(contratosFiltrados.length / this.itemsPerPage);

    const paginas: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= 10) {
      for (let i = 1; i <= this.totalPages; i++) {
        paginas.push(i);
      }
    } else {
      if (this.currentPage <= maxVisible) {
        for (let i = 1; i <= maxVisible; i++) {
          paginas.push(i);
        }
        paginas.push(-1); // ...
        paginas.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - maxVisible + 1) {
        paginas.push(1);
        paginas.push(-1); // ...
        for (
          let i = this.totalPages - maxVisible + 1;
          i <= this.totalPages;
          i++
        ) {
          paginas.push(i);
        }
      } else {
        paginas.push(1);
        paginas.push(-1); // ...
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          paginas.push(i);
        }
        paginas.push(-1); // ...
        paginas.push(this.totalPages);
      }
    }

    this.paginasVisibles = paginas;
  }

  filtrarUsuarios(): void {
    // lógica para filtrar
    this.currentPage = 1;
    this.actualizarPaginacion();
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
      this.actualizarPaginacion();
    }
  }

  chart: any;
  generarGrafico(): void {
    this.contratosService.obtenerContratosCompletos().subscribe({
      next: (res) => {
        const contratos = res.data;

        const conteoPorArea: { [key: string]: number } = {};
        contratos.forEach((contrato: any) => {
          const nombreArea = contrato.area?.nombreArea || 'Sin Área';
          conteoPorArea[nombreArea] = (conteoPorArea[nombreArea] || 0) + 1;
        });

        const labels = Object.keys(conteoPorArea);
        const data = Object.values(conteoPorArea);

        if (this.chart) this.chart.destroy();

        this.chart = new Chart('graficaContratos', {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Contratos por Área',
                data,
                backgroundColor: [
                  '#4e73df',
                  '#1cc88a',
                  '#36b9cc',
                  '#f6c23e',
                  '#e74a3b',
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: 'Distribución de Contratos por Área',
              },
            },
          },
        });
      },
      error: (err) => {
        console.error('Error al obtener contratos para el gráfico', err);
      },
    });
  }
  abrirModalReporte(): void {
    const modal = new bootstrap.Modal(
      document.getElementById('modalReporteContratos')!
    );
    modal.show();

    this.generarGrafico();
  }

  descargarExcel(): void {
    this.contratosService.obtenerContratosCompletos().subscribe({
      next: (res) => {
        const contratos = res.data;

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Contratos por Área');

        sheet.columns = [
          { header: 'Documento', key: 'documento', width: 20 },
          { header: 'Nombre', key: 'nombre', width: 30 },
          { header: 'Correo', key: 'correo', width: 30 },
          { header: 'Área', key: 'area', width: 25 },
          { header: 'Tipo de Contrato', key: 'tipo', width: 25 },
        ];

        const contratosPorArea: { [area: string]: any[] } = {};

        contratos.forEach((c: any) => {
          const area = c.area?.nombreArea || 'Sin Área';
          if (!contratosPorArea[area]) contratosPorArea[area] = [];
          contratosPorArea[area].push(c);
        });

        Object.entries(contratosPorArea).forEach(([area, lista]) => {
          const areaRow = sheet.addRow([`Área: ${area}`]);
          areaRow.font = { bold: true };
          areaRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' },
          };
          sheet.mergeCells(`A${areaRow.number}:E${areaRow.number}`);

          const encabezadoRow = sheet.addRow([
            'Documento',
            'Nombre',
            'Correo',
            'Área',
            'Tipo de Contrato',
          ]);
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

          lista.forEach((c, i) => {
            const u = c.hoja_de_vida?.usuario;
            const dataRow = sheet.addRow([
              u?.numDocumento || '',
              `${u?.primerNombre || ''} ${u?.primerApellido || ''}`,
              u?.email || '',
              c.area?.nombreArea || '',
              c.tipo_contrato?.nomTipoContrato || '',
            ]);
            if (i % 2 === 0) {
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
          saveAs(blob, 'contratos_por_area.xlsx');
        });
      },
      error: (err) => {
        console.error('Error al generar Excel de contratos', err);
      },
    });
  }

  descargarPDF(): void {
    this.contratosService.obtenerContratosCompletos().subscribe({
      next: (res) => {
        const contratos = res.data;

        const doc = new jsPDF();
        const imgLogo = new Image();
        imgLogo.src = 'https://i.postimg.cc/BnHG09W1/logo.png';

        imgLogo.onload = () => {
          doc.setFillColor(4, 26, 43);
          doc.rect(0, 0, 210, 30, 'F');
          doc.addImage(imgLogo, 'PNG', 10, 5, 20, 20);
          doc.setFontSize(16);
          doc.setTextColor(200);
          doc.text('Reporte de Contratos por Área - ManageHR', 35, 15);

          let startY = 35;

          const canvas: any = document.getElementById('graficaContratos');
          if (canvas) {
            const graficaImg = canvas.toDataURL('image/png', 1.0);
            doc.addImage(graficaImg, 'PNG', 10, startY, 180, 80);
            startY += 90;
          }

          const contratosPorArea: { [area: string]: any[] } = {};
          contratos.forEach((c: any) => {
            const area = c.area?.nombreArea || 'Sin Área';
            if (!contratosPorArea[area]) contratosPorArea[area] = [];
            contratosPorArea[area].push(c);
          });

          Object.entries(contratosPorArea).forEach(([area, lista]) => {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Área: ${area}`, 10, startY);

            const body = lista.map((c) => {
              const u = c.hoja_de_vida?.usuario;
              return [
                u?.numDocumento || '',
                `${u?.primerNombre || ''} ${u?.primerApellido || ''}`,
                u?.email || '',
                c.tipo_contrato?.nomTipoContrato || '',
              ];
            });

            autoTable(doc, {
              head: [['Documento', 'Nombre', 'Correo', 'Tipo de Contrato']],
              body,
              startY: startY + 5,
              theme: 'grid',
              styles: { halign: 'left', fontSize: 10 },
              didParseCell: (data) => {
                if (data.section === 'body' && data.row.index % 2 === 0) {
                  data.cell.styles.fillColor = [240, 240, 240];
                }
              },
            });

            startY = (doc as any).lastAutoTable.finalY + 10;
          });

          doc.save('contratos_por_area.pdf');
        };
      },
      error: (err) => {
        console.error('Error al generar PDF de contratos', err);
      },
    });
  }
}
