import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-session-warning-popup',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './session-warning-popup.html',
  styleUrls: ['../autenticacion.css', './session-warning-popup.css']
})
export class SessionWarningPopup {
  constructor(
    private dialogRef: MatDialogRef<SessionWarningPopup>,
    @Inject(MAT_DIALOG_DATA) public data: { countdown: number },
    private cdr: ChangeDetectorRef
  ) {}

  ActualizarCuentaRegresiva(value: number) {
    this.data.countdown = value;
    this.cdr.detectChanges();
  }

  ContinuarSesionActiva() {
    this.dialogRef.close(true);
  }
}