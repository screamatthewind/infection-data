import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { IMyOptions, LocaleService } from 'ng-uikit-pro-standard';
import { SelectionModel } from '../../models/selection.model';
import { SharedService } from '../../services/shared.service';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
})

export class SelectorComponent implements OnInit {

    @Output() regionSelectedEvent: EventEmitter<any> = new EventEmitter<any>();

    region: string;
    regions: Array<any> = [];
    baseUrl: string;
    http: HttpClient;

    startDate: Date;
    endDate: Date;

    public datePickerOptions: IMyOptions =
        {
            closeAfterSelect: true
        };

    public locales = {
        'en': {
            dayLabels: { su: 'Sun', mo: 'Mon', tu: 'Tue', we: 'Wed', th: 'Thu', fr: 'Fri', sa: 'Sat' },
            dayLabelsFull: { su: 'Sunday', mo: 'Monday', tu: 'Tuesday', we: 'Wednesday', th: 'Thursday', fr: 'Friday', sa: 'Saturday' },
            monthLabels: {
                1: 'Jan', 2: 'Feb', 3: 'Mär', 4: 'Apr', 5: 'May', 6: 'Jun',
                7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
            },
            monthLabelsFull: {
                1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June', 7: 'July',
                8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'
            },
            dateFormat: 'mm/dd/yyyy',
            todayBtnTxt: 'Today',
            clearBtnTxt: 'Clear',
            closeBtnTxt: 'Close',
            firstDayOfWeek: 'mo',
            sunHighlight: true,
        }
    };

    constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private localeService: LocaleService, private datepipe: DatePipe, private sharedService: SharedService) {

        this.localeService.setLocaleOptions(this.locales);

        this.baseUrl = baseUrl;
        this.http = http;
        this.region = 'all';
    }

    message: SelectionModel;

    ngOnInit() {
        this.sharedService.sharedMessage.subscribe(message => {
            if ((message.startDate != undefined) && (message.startDate != "undefined"))
                this.startDate = new Date(message.startDate);

            if ((message.endDate != undefined) && (message.endDate != "undefined"))
                this.endDate = new Date(message.endDate);
        });

        this.http.get<string[]>(this.baseUrl + 'Regions').subscribe(results => {

            for (let result of results)
                this.regions.push(result);

        }, error => console.error(error));

        let storedRegion = localStorage.getItem('region');
        if (storedRegion != null)
            this.region = storedRegion;
    }

    handleRegionSelection($event: any) 
    {
        this.region = $event.target.text;
        this.showUpdateButton = true;

        return false;
    }

    showUpdateButton: Boolean = false;

    datePickerChanged()
    {
        this.showUpdateButton = true;
    }

    updateScreen()
    {
        this.showUpdateButton = false;

        let selection = new SelectionModel();

        selection.region = this.region;

        if (this.startDate != undefined)
            selection.startDate = this.datepipe.transform(this.startDate, 'MM/dd/yyyy');

        if (this.endDate != undefined)
            selection.endDate = this.datepipe.transform(this.endDate, 'MM/dd/yyyy');

        localStorage.setItem("region", this.region);
        sessionStorage.setItem("startDate", selection.startDate);
        sessionStorage.setItem("endDate", selection.endDate);

        this.regionSelectedEvent.emit(selection);

        return false;
    }
}