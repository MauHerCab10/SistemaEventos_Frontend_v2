import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AccessService } from '../../../services/access-service';
import { UtilityService } from '../../../services/utility-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['../autenticacion.css', './forgot-password.css']
})
export class ForgotPasswordComponent {
  constructor(
    private _servicioUtilidad: UtilityService
  ) { }

  @Output() backToSignIn = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<string>();
  @Output() screenLoadingChange = new EventEmitter<boolean>();

  private serviceAcceso = inject(AccessService);
  private router = inject(Router);
  public fb = inject(FormBuilder);

  public formForgotPassword: FormGroup = this.fb.group({
    email: ["", Validators.required]
  });

  //Envía la solicitud de recuperación de contraseña
  OlvidoSuContrasena() {
    this.formForgotPassword.markAllAsTouched();

    if (this.formForgotPassword.invalid) {
      this._servicioUtilidad.MostarAlerta("Diligencie primero el campo obligatorio", "ERROR");
      return;
    }
    
    this.screenLoadingChange.emit(true);

    let email: string = this.formForgotPassword.value.email;

    this.serviceAcceso.OlvidoSuContrasena(email).subscribe({
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

  //Regresar al módulo de inicio de sesión
  onBackToSignIn() {
    this.backToSignIn.emit();
  }

}