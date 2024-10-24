import {  GestionNotificationComponent } from './pages/gestion-notification/gestion-notification.component';

import { Routes, RouterModule } from "@angular/router";
import { ManagerComponent } from "./manager.component";
import { GestionPersonnelComponent } from "./pages/gestion-contrat/gestion-contrat.component";
import { GestionServicesComponent } from "./pages/gestion-utilisateur/gestion-utilisateur.component";
import { NgModule } from "@angular/core";
import { GestionAdministrateurComponent } from "./pages/gestion-administrateur/gestion-administrateur.component";
import { GestionPubComponent } from './pages/gestion-pub/gestion-pub.component'; 
import { GestionCarteComponent } from './pages/gestion-carte/gestion-carte.component';

const routes: Routes = [
  {
    path: "",
    component: ManagerComponent,
    children: [
      {
        path: "contrat", 
        component: GestionPersonnelComponent, 
      },
      {
        path: "notification",
        component: GestionNotificationComponent,
      },
      {
        path: "utilsateur", 
        component: GestionServicesComponent,
      },
      {
        path: "demande", 
        component: GestionAdministrateurComponent,
      },
      {
        path: "association", 
        component: GestionPubComponent,
      }, 
      {
        path: "carte", 
        component: GestionCarteComponent,
      },
      {
        path: "",
        redirectTo: "utilsateur",
        pathMatch: "full",
      },
      { path: "**", redirectTo: "utilsateur", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerRoutes {}
