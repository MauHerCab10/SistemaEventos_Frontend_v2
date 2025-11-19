import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-session-warning-popup',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './session-warning-popup.html',
  styleUrl: './session-warning-popup.css'
})
export class SessionWarningPopup {
  constructor(
    private dialogRef: MatDialogRef<SessionWarningPopup>,
    @Inject(MAT_DIALOG_DATA) public data: { countdown: number }
  ) {}

  ContinuarSesionActiva() {
    this.dialogRef.close(true);
  }
}