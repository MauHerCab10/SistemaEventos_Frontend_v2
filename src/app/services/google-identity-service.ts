import { Injectable, NgZone, inject } from '@angular/core';

import { appsettings } from '../settings/appsettings';

declare const google: any;

type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
type GoogleCredentialHandler = (credential: string) => void;

//Servicio para integrar el inicio de sesión y registro con Google utilizando el SDK de Google Identity Services, entregando la credencial al componente que la solicitó
@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private ngZone = inject(NgZone);
  private sdkReadyPromise?: Promise<void>;
  private initialized = false;
  private handlers = new Map<string, GoogleCredentialHandler>();

  registerButton(
    container: HTMLElement,
    state: string,
    buttonText: GoogleButtonText,
    handler: GoogleCredentialHandler,
  ): Promise<void> {
    this.handlers.set(state, handler);

    return this.ensureInitialized().then(() => {
      container.innerHTML = '';
      google.accounts.id.renderButton(container, {
        type: 'icon',
        theme: 'outline',
        shape: 'circle',
        size: 'large',
        text: buttonText,
        state,
      });
    });
  }

  private ensureInitialized(): Promise<void> {
    return this.waitForGoogleIdentityServices().then(() => {
      if (this.initialized) {
        return;
      }

      google.accounts.id.initialize({
        client_id: appsettings.googleClientId,
        callback: (response: any) => {
          const state = response?.state;
          const credential = response?.credential;
          const handler = state ? this.handlers.get(state) : undefined;

          if (!credential || !handler) {
            return;
          }

          this.ngZone.run(() => handler(credential));
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      this.initialized = true;
    });
  }

  private waitForGoogleIdentityServices(): Promise<void> {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      this.sdkReadyPromise = Promise.resolve();
      return this.sdkReadyPromise;
    }

    if (this.sdkReadyPromise) {
      return this.sdkReadyPromise;
    }

    this.sdkReadyPromise = new Promise((resolve, reject) => {
      let attempts = 0;
      const intervalId = window.setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          window.clearInterval(intervalId);
          resolve();
          return;
        }

        attempts += 1;
        if (attempts >= 50) {
          window.clearInterval(intervalId);
          reject(new Error('Google Identity Services no estuvo disponible a tiempo'));
        }
      }, 100);
    });

    return this.sdkReadyPromise;
  }
}