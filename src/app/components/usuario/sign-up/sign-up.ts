import { Component, Output, EventEmitter, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccessService } from '../../../services/access-service';
import { UtilityService } from '../../../services/utility-service';
import { Registro } from '../../../interfaces/Registro';
import { AuthGoogle } from '../../../interfaces/AuthGoogle';
import { appsettings } from '../../../settings/appsettings';

declare const google: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrls: ['../autenticacion.css', './sign-up.css']
})
export class SignUpComponent {
  constructor(
    private _servicioUtilidad: UtilityService,
    private _servicioAcceso: AccessService
  ){ }

  @Output() socialLogin = new EventEmitter<string>();
  @Output() signUpSubmit = new EventEmitter<any>();
  @Output() registroExitoso = new EventEmitter<void>();
  @Output() screenLoadingChange = new EventEmitter<boolean>();

  public fb = inject(FormBuilder);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  
  public formSignUp: FormGroup = this.fb.group({
    nombreApellido: ["", Validators.required],
    email: ["", Validators.required],
    contrasena: ["", Validators.required],
  });

  //Permite al usuario registrarse en el sistema
  RegistrarUsuario(){
    this.formSignUp.markAllAsTouched();

    if (this.formSignUp.invalid) {
      this._servicioUtilidad.MostarAlerta("Diligencie primero todos los campos obligatorios antes de proceder", "ERROR");
      return;
    }

    this.screenLoadingChange.emit(true);

    let registro: Registro = {
      nombreApellido: this.formSignUp.value.nombreApellido,
      email: this.formSignUp.value.email,
      contrasena: this.formSignUp.value.contrasena
    }

    this._servicioAcceso.RegistrarUsuario(registro).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.registroExitoso.emit();
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

  // Manejar el Registro con Redes Sociales (solo Facebook y LinkedIn, Google usa renderButton)
  onSocialLogin(provider: string) {
    this.socialLogin.emit(provider);
  }

  // Inicializa Google e inmediatamente abre el popup al hacer clic en el botón personalizado
  onGoogleSignup() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: appsettings.googleClientId,
        callback: (response: any) => {
          this.ngZone.run(() => this.procesarSignupGoogle(response.credential));
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      google.accounts.id.prompt();
    }
  }

  // Decodifica el ID token JWT de Google y llama al backend para registrar el usuario
  private procesarSignupGoogle(credentialJwt: string) {
    try {
      const base64Url = credentialJwt.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const binary = window.atob(base64);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const payload = JSON.parse(new TextDecoder().decode(bytes));

      const authGoogle: AuthGoogle = {
        nombre: payload.name,
        email: payload.email,
        googleSub: payload.sub,
      };

      this.screenLoadingChange.emit(true);

      this._servicioAcceso.RegistrarUsuarioGoogle(authGoogle).subscribe({
        next: (respuesta) => {
          if (respuesta.isSuccess) {
            this.registroExitoso.emit();
            this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "OK 😊");
          } else {
            this._servicioUtilidad.MostarAlerta(respuesta.mensaje, 'ERROR 😢');
          }
        },
        error: () => {
          this._servicioUtilidad.MostarAlerta('No se pudo completar el registro con Google', 'ERROR 😢');
        },
        complete: () => {
          this.screenLoadingChange.emit(false);
        }
      });
    } catch {
      this._servicioUtilidad.MostarAlerta('No se pudo procesar el token de Google', 'ERROR 😢');
    }
  }
}