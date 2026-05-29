import { AfterViewInit, Component, ElementRef, Output, EventEmitter, ViewChild, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { AccessService } from '../../../services/access-service';
import { GoogleIdentityService } from '../../../services/google-identity-service';
import { UtilityService } from '../../../services/utility-service';
import { Login } from '../../../interfaces/Login';
import { AuthGoogle } from '../../../interfaces/AuthGoogle';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrls: ['../autenticacion.css', './sign-in.css']
})
export class SignInComponent implements AfterViewInit {
  constructor(
    private _servicioUtilidad: UtilityService,
    private _servicioAcceso: AccessService,
    private route: ActivatedRoute,
    private googleIdentityService: GoogleIdentityService,
  ){ }

  @Output() socialLogin = new EventEmitter<string>();
  @Output() signInSubmit = new EventEmitter<any>();
  @Output() forgotPassword = new EventEmitter<void>();
  @Output() screenLoadingChange = new EventEmitter<boolean>();

  @ViewChild('googleLoginButton', { static: true })
  private googleLoginButton?: ElementRef<HTMLDivElement>;

  private router = inject(Router);
  public fb = inject(FormBuilder);
  private ngZone = inject(NgZone);

  public formSignIn: FormGroup = this.fb.group({
    email: ["", Validators.required],
    contrasena: ["", Validators.required],
  });

  //Permite al usuario iniciar sesión en el sistema con Google utilizando el SDK de Google Identity Services
  ngAfterViewInit() {
    if (!this.googleLoginButton) {
      return;
    }

    this.googleIdentityService
      .registerButton(
        this.googleLoginButton.nativeElement,
        'signin',
        'signin_with',
        (credential) => this.procesarLoginGoogle(credential),
      )
      .catch(() => {
        this._servicioUtilidad.MostarAlerta('No se pudo cargar el acceso con Google', 'ERROR 😢');
      });
  }


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
          sessionStorage.setItem("nombreUsuario", respuesta.nombreUsuario.toString());
          sessionStorage.setItem("accessToken", respuesta.accessToken);
          
          this.router.navigate(['inicio']);
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

  // Manejar el Login con Redes Sociales (solo Facebook y LinkedIn, Google usa renderButton)
  onSocialLogin(provider: string) {
    this.socialLogin.emit(provider);
  }

  // Decodifica el ID token JWT de Google y llama al backend para autenticar al usuario
  private procesarLoginGoogle(credentialJwt: string) {
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

      this._servicioAcceso.AutenticarUsuarioGoogle(authGoogle).subscribe({
        next: (respuesta) => {
          if (respuesta.isSuccess) {
            sessionStorage.setItem('idUsuario', respuesta.idUsuario.toString());
            sessionStorage.setItem('nombreUsuario', respuesta.nombreUsuario);
            sessionStorage.setItem('accessToken', respuesta.accessToken);
            this.router.navigate(['inicio']);
            this._servicioUtilidad.MostarAlerta(`¡Bienvenido, ${respuesta.nombreUsuario}! 😊`, 'OK 😊');
          } else {
            this._servicioUtilidad.MostarAlerta(respuesta.mensaje, 'ERROR 😢');
          }
        },
        error: (err) => {
          this._servicioUtilidad.MostarAlerta('No se pudo completar el inicio de sesión con Google', 'ERROR 😢');
        },
        complete: () => {
          this.screenLoadingChange.emit(false);
        }
      });
    } catch {
      this._servicioUtilidad.MostarAlerta('No se pudo procesar el token de Google', 'ERROR 😢');
    }
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