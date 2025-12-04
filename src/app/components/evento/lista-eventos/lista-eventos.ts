import { Component, AfterViewInit, ViewChild, OnInit, inject, ChangeDetectorRef  } from '@angular/core'; //ViewChild: nos permite crear una instancia de algún componente q tenemos dentro de nuestro HTML
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

//Componentes de Angular Material:
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Evento } from '../../../interfaces/Evento';
import { EventoService } from '../../../services/evento-service';
import { UtilityService } from '../../../services/utility-service';
import { ModalEvento } from '../../evento/modal-evento/modal-evento';
import { AccessService } from '../../../services/access-service';
import { SessionTimeoutService } from '../../../services/session-timeout-service';

@Component({
  selector: 'app-lista-eventos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatGridListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  providers: [DatePipe],
  templateUrl: './lista-eventos.html',
  styleUrl: './lista-eventos.css',
})
export class EventosComponent {
  screenLoading: boolean = false;
  router = inject(Router);
  columnasTablaSinExpansion: string[] = ['nombreEvento']; //'fechaHora','direccion_Ubicacion','capMaxPermitida','cantidadAsistentes','usuarioInscrito','acciones' //'idEvento','idUsuarioCreacion','cuposDisponibles','descripcion'
  columnasTablaConExpansion = [...this.columnasTablaSinExpansion, 'expand'];
  dataOrigenDatos: Evento[] = [];
  dataListaEventos = new MatTableDataSource(this.dataOrigenDatos); //dataListaEventos = fuente de datos de nuestra tabla de Eventos
  @ViewChild(MatPaginator) paginacionTabla! : MatPaginator; //el signo (!) ayuda a q la variable nunca sea null y q siempre tenga valor
  idUsuario = sessionStorage.getItem("idUsuario") || '';
  nombreUsuario = sessionStorage.getItem("nombreUsuario") || '';
  suscripcionesUsuarioActual: number = 0;
  textoBusqueda: string = '';
  expandedElement: Evento | undefined;
  
  constructor(
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private _servicioUtilidad: UtilityService,
    private _servicioEvento: EventoService,
    private _servicioAcceso: AccessService,
    private _sessionService: SessionTimeoutService,
    private cdr: ChangeDetectorRef
  ){}

  //Inicializa el componente de lista de eventos encargado de visualizar la lista de eventos disponibles
  ngOnInit(): void {
    //'AplicarFiltroBusquedaTabla()' solo va a filtrar por 'nombreEvento', por ningún otro campo más
    this.dataListaEventos.filterPredicate = (data: Evento, filter: string) => {
      let filtro = data.nombreEvento.toLowerCase().includes(filter);
      return filtro;
    };

    this.ObtenerEventos();
    this._sessionService.ConfigurarSessionTimer();
    this._sessionService.ResetSessionTimer();
  }

  //Luego de inicializar todo el componente, se inicializa la paginación de la tabla de eventos
  ngAfterViewInit(): void {
    this.dataListaEventos.paginator = this.paginacionTabla;
  }

  //Comprueba si una fila seleccionada está expandida
  FilaExpandida(element: Evento) {
    return this.expandedElement === element;
  }

  //Alterna el estado expandido y recogido de una fila seleccionada
  AlternarVisualizacionDetallesFila(element: Evento) {
    this.expandedElement = this.FilaExpandida(element) ? undefined : element;
  }

  //Retorna y reestructura la lista de todos los eventos disponibles q hay en el sistema
  ObtenerEventos(){
    this.screenLoading = true;
    this._servicioEvento.ConsultarEventosDisponibles(this.idUsuario).subscribe({
      next: (response) => {
        if(response.isSuccess) {
          //this.dataListaEventos.data = response.value; <- ANTES
          this.dataListaEventos.data = response.valor.map((evento: Evento) => { //map: recorre cada elemento de response.value
            return {
              ...evento, //Spread Operator (...): se utiliza para copiar el resto de las propiedades del objeto Evento sin necesidad de reescribirlas una a una
              fechaHora: this.datePipe.transform(evento.fechaHora, 'dd/MMM/yyyy (h:mm a)')
            };
          });
          
        this.suscripcionesUsuarioActual = response.valor.filter((evento: { esUsuarioInscrito: boolean; }) => evento.esUsuarioInscrito).length;
        } else {
          // this._servicioUtilidad.MostarAlerta("No tienes ningún evento registrado.", "Oops!");
        }
      },
      error: (ex) => {
        this._servicioUtilidad.MostarAlerta(`${ex?.error?.mensaje} ${ex?.message}`, "ERROR 😢");
        console.log(ex.message);
        
        if(!ex.error.isSuccess && ex.error.valor == null && ex.error.mensaje === "El AccessToken y/o el RefreshToken suministrados no existen, ó el RefreshToken no se encuentra activo para ese usuario.")
          this.router.navigate(['login']);
      },
      complete: () => {
        this.screenLoading = false;
      }
    });
  }

  //Filtra los registros de la tabla de eventos según el texto q se vaya ingresando en el campo de búsqueda
  AplicarFiltroBusquedaTabla(event: Event){
    this.textoBusqueda = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataListaEventos.filter = this.textoBusqueda.trim();
  }

  //Coloca en negrita el texto q coincide con la búsqueda realizada por el usuario
  ResaltarCoincidencia(valorRegistro: string, textoBusqueda: string) {
    if (!textoBusqueda)
      return valorRegistro;

    const regex = new RegExp(`(${textoBusqueda})`, 'i'); //Flag 'g' para búsqueda global y resalte todas las apariciones, y Flag 'i' para ignorar mayúsculas/minúsculas
    const resultado = valorRegistro.replace(regex, '<strong>$1</strong>');

    return this.sanitizer.bypassSecurityTrustHtml(resultado);
  }

  //Despliega un modal para crear un nuevo evento
  ModalCrearEvento(){
    this.dialog.open(ModalEvento, {
      disableClose: true,
    }).afterClosed().subscribe(resultado => {
      if(resultado === "true")
        this.ObtenerEventos();
    });
  }

  //Despliega un modal para editar el evento seleccionado
  ModalEditarEvento(evento:Evento){
    this.dialog.open(ModalEvento, {
      disableClose: true,
      data: evento
    }).afterClosed().subscribe(resultado => {
      if(resultado === "true")
        this.ObtenerEventos();
    });
  }

  //Despliega un modal para confirmar la eliminación del evento seleccionado
  ModalEliminarEvento(evento:Evento){
    Swal.fire({
      title: "¿Desea eliminar este evento?",
      text: evento.nombreEvento,
      icon: 'warning',
      timer: 10000,
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Sí. Eliminar",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: "No. Cancelar"
    }).then((resultado) => {
      if(resultado.isConfirmed){
        this.screenLoading = true;
        this.cdr.detectChanges();

        this._servicioEvento.EliminarEvento(evento.idEvento).subscribe({
          next: (response) => {
            if(response.isSuccess){
              this._servicioUtilidad.MostarAlerta("¡El evento ha sido eliminado exitosamente!", "Listo");
              this.ObtenerEventos();
            } else {
              this._servicioUtilidad.MostarAlerta("Error al eliminar el evento.", "Error");
            }
          },
          error: (ex) => {
            this._servicioUtilidad.MostarAlerta(`${ex?.error?.mensaje} ${ex?.message}`, "ERROR 😢");
            console.log(ex.message);
          },
          complete: () => {
            this.screenLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  //Despliega un modal para confirmar la inscripción al evento seleccionado
  ModalInscripcionAEvento(evento:Evento){
    Swal.fire({
      title: "¿Desea inscribirse a este evento?",
      text: evento.nombreEvento,
      icon: 'warning',
      timer: 10000,
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Sí",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: "No. Cancelar"
    }).then((resultado) => {
      if(resultado.isConfirmed){
        this.screenLoading = true;
        this.cdr.detectChanges();

        this._servicioEvento.InscripcionAEvento(evento.idEvento, Number(this.idUsuario)).subscribe({
          next: (response) => {
            if(response.isSuccess){
              this._servicioUtilidad.MostarAlerta("¡Se ha inscrito satisfactoriamente al evento!", "Listo");
              this.ObtenerEventos();
            } else {
              this._servicioUtilidad.MostarAlerta("Error al inscribirse al evento.", "Error");
            }
          },
          error: (ex) => {
            this._servicioUtilidad.MostarAlerta(`${ex?.error?.mensaje} ${ex?.message}`, "ERROR 😢");
            console.log(ex.message);
          },
          complete: () => {
            this.screenLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  //Despliega un modal para confirmar la dimisión del evento seleccionado
  ModalDimisionDeEvento(evento:Evento){
    Swal.fire({
      title: "¿Desea darse de baja de este evento?",
      text: evento.nombreEvento,
      icon: 'warning',
      timer: 10000,
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Sí",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: "No. Cancelar"
    }).then((resultado) => {
      if(resultado.isConfirmed){
        this.screenLoading = true;
        this.cdr.detectChanges();
        
        this._servicioEvento.DimisionDeEvento(evento.idEvento, Number(this.idUsuario)).subscribe({
          next: (response) => {
            if(response.isSuccess){
              this._servicioUtilidad.MostarAlerta("¡Se ha dado de baja del evento satisfactoriamente!", "Listo");
              this.ObtenerEventos();
            } else {
              this._servicioUtilidad.MostarAlerta("Error al darse de baja del evento.", "Error");
            }
          },
          error: (ex) => {
            this._servicioUtilidad.MostarAlerta(`${ex?.error?.mensaje} ${ex?.message}`, "ERROR 😢");
            console.log(ex.message);
          },
          complete: () => {
            this.screenLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  //Permite al usuario cerrar su sesión en el sistema
  CerrarSesion(){
    this.screenLoading = true;
    let accessToken:string = sessionStorage.getItem('accessToken') ?? "";

    this._servicioAcceso.CerrarSesion(accessToken).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          sessionStorage.removeItem("idUsuario");
          sessionStorage.removeItem("nombreUsuario");
          sessionStorage.removeItem("accessToken");

          this.router.navigate(['login']);
          this._sessionService.FinishSessionTimer();
          this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "OK 😊");
        } else {
          this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "ERROR 😢");
        }
      },
      error:(ex) => {
        this.router.navigate(['login']);
        this._servicioUtilidad.MostarAlerta(`${ex?.error?.mensaje} ${ex?.message}`, "ERROR 😢");
        console.log(ex.message);
      },
      complete: () => {
        this.screenLoading = false;
      }
    });
  }

}