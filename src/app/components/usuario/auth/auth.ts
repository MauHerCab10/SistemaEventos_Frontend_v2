import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignInComponent } from '../sign-in/sign-in';
import { SignUpComponent } from '../sign-up/sign-up';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password';
import { UpdatePasswordComponent } from '../update-password/update-password';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, SignInComponent, SignUpComponent, ForgotPasswordComponent, UpdatePasswordComponent],
  templateUrl: './auth.html',
  styleUrls: ['../autenticacion.css', './auth.css']
})
export class AuthComponent {
  public isSignUpMode = false;
  public isForgotPasswordMode = false;
  public isUpdatePasswordMode = false;
  public screenLoading: boolean = false;
  private route = inject(ActivatedRoute);

  // Cambiar a modo SignUp
  switchToSignUp() {
    this.isSignUpMode = true;
    this.isForgotPasswordMode = false;
  }

  // Cambiar a modo SignIn
  switchToSignIn() {
    this.isSignUpMode = false;
    this.isForgotPasswordMode = false;
  }

  // Ir a ForgotPassword
  onForgotPassword() {
    this.isForgotPasswordMode = true;
  }

  // Volver a SignIn desde ForgotPassword o desde UpdatePassword
  onBackToSignIn() {
    this.isForgotPasswordMode = false;
    this.isUpdatePasswordMode = false;
  }

  // Volver a SignIn desde SignUp tras registro exitoso
  onRegistroExitoso() {
    this.isSignUpMode = false;
  }

  // Cambiar estado de pantalla por uno de "Cargando..."
  onChangeLoadingScreen(state: boolean) {
    this.screenLoading = state;
  }

  // Ir a UpdatePassword por QueryParam
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['guidAcceso'])
        this.isUpdatePasswordMode = true;
    });
  }
  
}