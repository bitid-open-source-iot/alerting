import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchModule } from 'src/app/components/search/search.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NotificationsPage } from './notifications.page';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationsRoutingModule } from './notifications-routing.module';

@NgModule({
    imports: [
        CommonModule,
        SearchModule,
        MatIconModule,
        MatTableModule,
        MatButtonModule,
        MatToolbarModule,
        MatProgressBarModule,
        NotificationsRoutingModule
    ],
    declarations: [
        NotificationsPage
    ]
})

export class NotificationsModule {}