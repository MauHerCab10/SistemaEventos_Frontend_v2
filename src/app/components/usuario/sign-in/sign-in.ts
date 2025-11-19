import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { AccessService } from '../../../services/access-service';
import { UtilityService } from '../../../services/utility-service';
import { Login } from '../../../interfaces/Login';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignInComponent {
  constructor(
    private _servicioUtilidad: UtilityService,
    private _servicioAcceso: AccessService,
    private route: ActivatedRoute,
  ){ }

  @Output() socialLogin = new EventEmitter<string>();
  @Output() signInSubmit = new EventEmitter<any>();
  @Output() forgotPassword = new EventEmitter<void>();
  @Output() screenLoadingChange = new EventEmitter<boolean>();

  private router = inject(Router);
  public fb = inject(FormBuilder);

  public formSignIn: FormGroup = this.fb.group({
    email: ["", Validators.required],
    contrasena: ["", Validators.required],
  });


  //Permite al usuario iniciar sesión en el sistema
  IniciarSesion(){
    this.formSignIn.markAllAsTouched();

    if(this.formSignIn.invalid) {
      this._servicioUtilidad.MostarAlerta("Diligencie primero todos los campos obligatorios antes de proceder", "ERROR");
      return;
    }

    this.screenLoadingChange.emit(true);

    let login: Login = {
      email: this.formSignIn.value.email,
      contrasena: this.formSignIn.value.contrasena,
    }

    this._servicioAcceso.LoginUsuario(login).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          
          sessionStorage.setItem("idUsuario", respuesta.idUsuario.toString());
          sessionStorage.setItem("accessToken", respuesta.accessToken);
          
          this.router.navigate(['inicio']);
          this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "OK 😊");
        } else {
          this._servicioUtilidad.MostarAlerta(`${respuesta.mensaje}`, "ERROR 😢");
        }
      },
      error:(respuesta) => {
        this.screenLoadingChange.emit(false);
        console.log(respuesta.message);
        this._servicioUtilidad.MostarAlerta(`${respuesta?.error?.mensaje} ${respuesta?.message}`, "ERROR 😢");
      },
      complete: () => {
        this.screenLoadingChange.emit(false);
      }
    });
  }

  // Manejar el Login con Redes Sociales
  onSocialLogin(provider: string) {
    console.log(`Login desde SignIn con ${provider}`);
    this.socialLogin.emit(provider);
    // implementar lógica para procesar el Login con redes sociales
  }

  //Se visualiza el componente de recuperación de contraseña
  onForgotPassword() {
    this.forgotPassword.emit();
  }

  // Manejar QueryParams para confirmación de cuenta desde el correo q recibe el usuario
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['confirmacion'] === 'ok') {
        this._servicioUtilidad.MostarAlerta('¡Su cuenta ha sido confirmada exitosamente 😊!', "✅", "center");
      } else if (params['confirmacion'] === 'error') {
        this._servicioUtilidad.MostarAlerta('¡El enlace es inválido o ya ha expirado 😢!', "❌", "center");
      }
    });
  }

}