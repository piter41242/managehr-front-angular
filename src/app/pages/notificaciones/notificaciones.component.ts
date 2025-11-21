import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component'; 

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent {
  notifications = [
    {
      id: 1,
      name: 'Juanita Pérez',
      description: 'Envió una solicitud de vacaciones para el periodo del 10 al 15 de diciembre.',
      date: '6 de diciembre, 2024'
    },
    {
      id: 2,
      name: 'María Bonilla',
      description: 'Se postuló para la vacante de Ingeniero de Sistemas. Revisar CV adjunto.',
      date: '5 de diciembre, 2024'
    },
    {
      id: 3,
      name: 'Pablo Álvarez',
      description: 'Solicitó días adicionales de vacaciones. Revisar detalles.',
      date: '5 de diciembre, 2024'
    },
    {
      id: 4,
      name: 'Juanita Pérez',
      description: 'Envió una solicitud de vacaciones para el periodo del 10 al 15 de diciembre.',
      date: '6 de diciembre, 2024'
    },
    {
      id: 5,
      name: 'María Bonilla',
      description: 'Se postuló para la vacante de Ingeniero de Sistemas. Revisar CV adjunto.',
      date: '5 de diciembre, 2024'
    },
    {
      id: 6,
      name: 'Carolina Ramírez',
      description: 'Registró horas extras del proyecto de desarrollo. Pendiente de aprobación.',
      date: '5 de diciembre, 2024'
    },
    {
      id: 7,
      name: 'Roberto Méndez',
      description: 'Presentó certificado médico por incapacidad de 3 días por procedimiento dental.',
      date: '5 de diciembre, 2024'
    }
  ];

  selectedNotification: any = null;
  modalVisible: boolean = false;

  aceptarNotificacion(notification: Notification): void {
    console.log('Notificación aceptada:', notification);
    this.closeDetailsModal(); 
  }
  
  rechazarNotificacion(notification: Notification): void {
    console.log('Notificación rechazada:', notification);
    this.closeDetailsModal();
    // Lógica adicional si aplica
  }
  

  openDetailsModal(notification: any): void {
    this.selectedNotification = notification;
    this.modalVisible = true;
  }

  closeDetailsModal(): void {
    this.modalVisible = false;
    this.selectedNotification = null;
  }

  showDeleteAlert(notification: any): void {
    if (confirm(`¿Estás seguro que deseas eliminar la notificación de "${notification.name}"?`)) {
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
    }
  }

  generarReporte(): void {
    alert('Generando reporte de notificaciones...');
  }
}
