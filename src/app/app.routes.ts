import { Routes } from '@angular/router';
import {AppComponent} from "./app.component";
import {ChatComponent} from "./components/chat/chat.component";
import {NotificationComponent} from "./components/notification/notification.component";
import { RemintonComponent } from './reminton/reminton.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent
  },
  {
    path: 'chat',
    component: ChatComponent
  },
  {
    path: 'notification',
    component: NotificationComponent
  },
  {
    path: 'reminton',
    component: RemintonComponent
  }
];
