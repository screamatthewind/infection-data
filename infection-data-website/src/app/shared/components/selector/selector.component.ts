import { Component, Input, Output, EventEmitter, Inject, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MDBDatePickerComponent, IMyOptions, LocaleService } from 'ng-uikit-pro-standard';
import { SelectionModel } from '../../models/selection.model';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
})

export class SelectorComponent {

    @ViewChild('datePicker', { static: true }) datePicker: MDBDatePickerComponent;
    @Output() regionSelectedEvent: EventEmitter<any> = new EventEmitter<any>();

    region: string;
    regions: Array<any> = [];
    baseUrl: string;
    http: HttpClient;

    startDate: Date;
    endDate: Date;

    public myDatePickerOptions: IMyOptions =
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

    constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private localeService: LocaleService) {

        this.localeService.setLocaleOptions(this.locales);

        this.baseUrl = baseUrl;
        this.http = http;
        this.region = 'all';
    }

    ngOnInit() {
        this.http.get<string[]>(this.baseUrl + 'Regions').subscribe(results => {

            for (let result of results)
                this.regions.push(result);

        }, error => console.error(error));

        let storedRegion = localStorage.getItem('region');
        if (storedRegion != null)
            this.region = storedRegion;
    }

    handleRegionSelection($event: any) {

        this.region = $event.target.text;

        return false;
    }

    updateScreen()
    {
        let selection = new SelectionModel();

        selection.region = this.region;
        selection.startDate = this.startDate;
        selection.endDate = this.endDate;

        this.regionSelectedEvent.emit(selection);

        return false;
    }
}