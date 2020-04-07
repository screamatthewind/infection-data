import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SelectionModel } from '../models/selection.model'

@Injectable()
export class SharedService {

  private selector: SelectionModel = new SelectionModel();
  private message = new BehaviorSubject(this.selector);
  sharedMessage = this.message.asObservable();

  constructor() { }

  nextMessage(message: SelectionModel) {
    this.message.next(message)
  }
  
}