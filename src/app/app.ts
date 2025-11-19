import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GlobalSpinnerComponent } from '../../src/app/components/usuario/global-spinner/global-spinner';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GlobalSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
