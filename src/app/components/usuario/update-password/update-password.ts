import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';

import { AccessService } from '../../../services/access-service';
import { UtilityService } from '../../../services/utility-service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RestablecimientoContrasena } from '../../../interfaces/RestablecimientoContrasena';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './update-password.html',
  styleUrls: ['../autenticacion.css', './update-password.css']
})
export class UpdatePasswordComponent implements OnInit {
    constructor(
      private _servicioUtilidad: UtilityService
    ) { }

    @Output() backToSignIn = new EventEmitter<void>();
    @Output() submitForm = new EventEmitter<string>();
    @Output() screenLoadingChange = new EventEmitter<boolean>();

    private serviceAcceso = inject(AccessService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    public fb = inject(FormBuilder);
    public guidAcceso: string = '';

    public formUpdatePassword: FormGroup = this.fb.group({
      nuevaContrasena: ["", Validators.required],
      confirmacionContrasena: ["", Validators.required]
    });

    //Permite al usuario actualizar su contraseña antigüa
    ActualizarContrasena() {
      this.formUpdatePassword.markAllAsTouched();

      if (this.formUpdatePassword.invalid) {
        this._servicioUtilidad.MostarAlerta("Diligencie primero todos los campos obligatorios antes de proceder", "ERROR");
        return;
      }

      this.screenLoadingChange.emit(true);

      let restablecimiento: RestablecimientoContrasena = {
        guidAcceso: this.guidAcceso,
        nuevaContrasena: this.formUpdatePassword.value.nuevaContrasena,
        confirmacionContrasena: this.formUpdatePassword.value.confirmacionContrasena,
      }

      this.serviceAcceso.ActualizarContrasenaAntigua(restablecimiento).subscribe({
        next: (respuesta) => {
          if (respuesta.isSuccess) {
            this.router.navigate(['login']);
            this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "OK 😊");
          } else {
            this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "ERROR 😢");
          }
        },
        error:(respuesta) => {
          this.screenLoadingChange.emit(false);
          this._servicioUtilidad.MostarAlerta(`${respuesta?.error?.mensaje} ${respuesta?.message}`, "ERROR 😢");
          console.log(respuesta.message);
        },
        complete: () => {
          this.screenLoadingChange.emit(false);
        }
      });
    }

    onBackToSignIn() {
      this.router.navigate(['login']);
    }

    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.guidAcceso = params['guidAcceso'];
      });
    }
}