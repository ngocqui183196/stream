import { Routes } from '@angular/router';
import {AppComponent} from "./app.component";
import {ChatComponent} from "./components/chat/chat.component";
import {NotificationComponent} from "./components/notification/notification.component";
import { RemintonComponent } from './components/reminton/reminton.component';
import { HomeComponent } from './components/change-detection/home/home.component';
import { MediaComponent } from './components/video-display/media.component';

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
  },
  {
    path: 'change-detection',
    component: HomeComponent
  },
  {
    path: 'media',
    component: MediaComponent
  }
];
