/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { AuthManager } from './services/account/account.manager';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        'path':         'signin',
        'loadChildren': () => import('./pages/signin/signin.module').then(m => m.SigninModule)
    },
    {
        'path':         'notifications',
        'canActivate':  [AuthManager],
        'loadChildren': () => import('./pages/notifications/notifications.module').then(m => m.NotificationsModule)
    },
    {
        'path':         '**',
        'redirectTo':   'notifications'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}