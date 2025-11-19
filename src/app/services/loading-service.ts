import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _isLoading = new BehaviorSubject<boolean>(false);
  public isLoading$ = this._isLoading.asObservable();

  Show() {
    this._isLoading.next(true);
  }

  Hide() {
    this._isLoading.next(false);
  }
}