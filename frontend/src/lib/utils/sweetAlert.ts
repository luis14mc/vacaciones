import Swal from 'sweetalert2';

// Configuración por defecto para SweetAlert
const defaultConfig = {
  confirmButtonColor: '#3B82F6',
  cancelButtonColor: '#6B7280',
  background: '#ffffff',
  color: '#374151',
  buttonsStyling: true,
  customClass: {
    confirmButton: 'swal-confirm-btn',
    cancelButton: 'swal-cancel-btn',
    popup: 'swal-popup',
    title: 'swal-title',
    content: 'swal-content'
  }
};

export const SweetAlert = {
  // Alerta de éxito
  success: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'success',
      title,
      text,
      timer: 2500,
      showConfirmButton: true,
      confirmButtonText: 'Genial',
      timerProgressBar: true,
      allowOutsideClick: true,
      allowEscapeKey: true
    });
  },

  // Alerta de error
  error: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido'
    });
  },

  // Alerta de información
  info: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Entendido'
    });
  },

  // Alerta de advertencia
  warning: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Entendido'
    });
  },

  // Confirmación de eliminación
  confirmDelete: (title: string = '¿Estás seguro?', text: string = 'Esta acción no se puede deshacer') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
      reverseButtons: true
    });
  },

  // Confirmación personalizada
  confirm: (title: string, text?: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true
    });
  },

  // Loading/Procesando
  loading: (title: string = 'Procesando...', text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  },

  // Cerrar SweetAlert
  close: () => {
    Swal.close();
  },

  // Toast personalizado
  toast: (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info', timer: number = 3000) => {
    return Swal.fire({
      ...defaultConfig,
      icon,
      title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  }
};

export default SweetAlert;