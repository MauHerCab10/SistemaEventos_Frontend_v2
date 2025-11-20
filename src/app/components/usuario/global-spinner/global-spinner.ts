import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingService } from '../../../services/loading-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [AsyncPipe, MatProgressSpinnerModule],
  templateUrl: './global-spinner.html',
  styleUrls: ['../autenticacion.css', './global-spinner.css']
})
export class GlobalSpinnerComponent {
  isLoading: any;

  constructor(private loadingService: LoadingService) {
    this.isLoading = this.loadingService.isLoading$;
  }
}