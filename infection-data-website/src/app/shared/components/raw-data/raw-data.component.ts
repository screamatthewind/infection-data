import { Component, Inject, OnInit } from '@angular/core';
import { InfectionData } from '../../models/infection-data.model';
import { HttpClient } from '@angular/common/http';

import { SelectionModel } from '../../models/selection.model';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
})

export class RawDataComponent implements OnInit {

  regionSelectionChanged(selection: any) {
    this.loadData(selection);
  }

  baseUrl: string;
  http: HttpClient;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private sharedService: SharedService) {

    this.baseUrl = baseUrl;
    this.http = http;

    let storedRegion = localStorage.getItem('region');
    let selection = new SelectionModel();

    if (storedRegion == null)
      selection.region = 'all';
    else
      selection.region = storedRegion;

    if (sessionStorage.getItem('startDate') != null)
      selection.startDate = sessionStorage.getItem('startDate');

    if (sessionStorage.getItem('endDate') != null)
      selection.endDate = sessionStorage.getItem('endDate');

    this.sharedService.nextMessage(selection);

    this.loadData(selection);
  }

  message: SelectionModel;

  ngOnInit() {
    this.sharedService.sharedMessage.subscribe(message => this.message = message)
  }

  public infections: InfectionData[];

  loadData(selection: SelectionModel) {

    this.http.get<InfectionData[]>(this.baseUrl + 'InfectionData?region=' + selection.region + '&pStartDate=' + selection.startDate + '&pEndDate=' + selection.endDate).subscribe(result => {

      this.infections = result;
      
    }, error => console.error(error));

  }
}