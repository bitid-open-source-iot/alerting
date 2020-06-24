import { MenuService } from 'src/app/services/menu/menu.service';
import { SearchComponent } from 'src/app/components/search/search.component';
import { MatTableDataSource } from '@angular/material/table';
import { OnInit, Component, OnDestroy, ViewChild } from '@angular/core';

@Component({
    selector:       'app-notifications-page',
    styleUrls:      ['./notifications.page.scss'],
    templateUrl:    './notifications.page.html'
})

export class NotificationsPage implements OnInit, OnDestroy {

    @ViewChild(SearchComponent, {'static': true}) private search: SearchComponent;

    constructor(public menu: MenuService) {};

    public columns:         string[]    = ['title', 'message', 'date'];
    public loading:         boolean;
    public notifications:   any         = new MatTableDataSource();
    public subscriptions:   any         = {};

    private async list() {};

    ngOnInit(): void {
        this.list();
        
        this.subscriptions.search = this.search.change.subscribe(filter => {
            this.notifications.filter = filter;
        });
    };

    ngOnDestroy(): void {
        this.subscriptions.search.unsubscribe();
    };

}