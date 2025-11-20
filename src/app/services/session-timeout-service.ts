import { inject, Injectable } from '@angular/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { NavigationEnd, Router } from '@angular/router';
import { UtilityService } from './utility-service';
import { AccessService } from './access-service';
import { LoadingService } from './loading-service';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { SessionWarningPopup } from '../components/usuario/session-warning-popup/session-warning-popup';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  private readonly idleTimeout = 180; //Tiempo (segs) de inactividad antes q inicie el contador de cierre de sesión automático
  private readonly timeoutWarning = 30; //Tiempo (segs) q dura el contador antes de cerrar la sesión automaticamente
  
  private idle = inject(Idle);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private warningPopupRef: any = null;
  private isConfigured = false;
  public screenLoading: boolean = false;
  
  constructor(
    private _servicioUtilidad: UtilityService,
    private _servicioAcceso: AccessService,
    private _servicioLoading: LoadingService
  ) { }

  //Configuración del temporizador de la sesión del usuario
  ConfigurarSessionTimer() {
    // evita duplicidad en la configuración del manejo de la sesión con Idle (Singleton)
    if (this.isConfigured)
      return;
    
    this.isConfigured = true;

    // Establece el tiempo de inactividad y advertencia
    this.idle.setIdle(this.idleTimeout); //tiempo de inactividad antes de que aparezca la advertencia con la cuenta regresiva
    this.idle.setTimeout(this.timeoutWarning); //tiempo de advertencia antes de cerrar sesión
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); //establece los eventos predeterminados que reiniciarán el temporizador de inactividad

    this.idle.onIdleStart.subscribe(() => {
      // console.log('¡USUARIO INACTIVO! Ha pasado el tiempo de inactividad establecido.');
    });

    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.MostrarPopupAdvertencia(countdown);
      // console.log(`La sesión se cerrará en ${countdown} segundos. Por favor, interactúe con la aplicación para continuar activo.`);
    });

    this.idle.onTimeout.subscribe(() => {
      this.CerrarPopupAdvertencia();
      this.LogoutAutomatico();
      // console.log('¡Tiempo agotado! Iniciando cierre de sesión automático...');
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
          this.ResetSessionTimer();
          // console.log('Tiempo de sesión reiniciado automáticamente al cambiar de pantalla.');
        }
      });
  }

  //Cierre de sesión automático por inactividad por parte del usuario
  LogoutAutomatico() {
    this._servicioLoading.Show();
    let accessToken:string = sessionStorage.getItem('accessToken') ?? "";
    
    this._servicioAcceso.CerrarSesion(accessToken).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          sessionStorage.removeItem("idUsuario");
          sessionStorage.removeItem("accessToken");

          this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "OK 😊");
          this.router.navigate(['login']);

          this.FinishSessionTimer();
        } else {
          this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "ERROR 😢");
        }
      },
      error:(respuesta) => {
        this._servicioLoading.Hide();
        this._servicioUtilidad.MostarAlerta(`${respuesta?.error?.mensaje} ${respuesta?.message}`, "ERROR 😢");
        console.log(respuesta.message);
      },
      complete: () => {
        this._servicioLoading.Hide();
      }
    });
  }
  
  //Muestra el popup de advertencia de cierre de sesión al usuario
  MostrarPopupAdvertencia(countdown: number) {
    if (this.warningPopupRef) {
      this.warningPopupRef.componentInstance.ActualizarCuentaRegresiva(countdown);
      return;
    }

    this.warningPopupRef = this.dialog.open(SessionWarningPopup, {
      disableClose: true,
      data: { countdown }
    });

    this.warningPopupRef.afterClosed().subscribe((continuar: boolean) => {
      if (continuar) {
        this.ResetSessionTimer();
        // console.log('El usuario decidió continuar con la sesión activa.');
      }
      this.warningPopupRef = null;
    });
  }

  //Cierra el popup de advertencia de cierre de sesión
  CerrarPopupAdvertencia() {
    if (this.warningPopupRef) {
      this.warningPopupRef.close();
      this.warningPopupRef = null;
    }
  }

  //Inicializa el temporizador de sesión
  ResetSessionTimer() {
    this.idle.watch();
    this.CerrarPopupAdvertencia();
    // console.log('Monitoreo de inactividad iniciado...');
  }

  //Finalización del temporizador de sesión
  FinishSessionTimer() {
    this.idle.stop();
    this.CerrarPopupAdvertencia();
    // console.log('¡Sesión cerrada exitosamente!');
  }

  //Pausa el temporizador de sesión
  PauseSessionTimer() {
    try {
      this.idle.stop();
      // console.log('⏸️ Temporizador de inactividad pausado por algún proceso del sistema.');
    } catch {}
  }

  //Reanuda el temporizador de sesión
  ResumeSessionTimer() {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      this.ResetSessionTimer();
      // console.log('▶️ Temporizador de inactividad reanudado.');
    }
  }

}