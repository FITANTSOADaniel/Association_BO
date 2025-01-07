import { Component, Input, OnInit } from "@angular/core";
import { LayoutService } from "../../service/app.layout.service";
import { MenuItem } from "primeng/api";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
})
export class MenuComponent implements OnInit {
  @Input() typeMenu?: string = "";
  menu: MenuItem[] = [];
  isMenuOpen = false;
  model: any[] = [];

  constructor(public layoutService: LayoutService) {}

  ngOnInit() {
    let data = {};

    const menuManager = {
      label: "",
      items: [
        {
          label: "Gestion clients",
          icon: "pi pi-fw pi-users",
          routerLink: ["/manager/utilsateur"],
        },
        {
          label: "Gestions des demandes",
          icon: "pi pi-fw pi-hourglass",
          routerLink: ["/manager/demande"],
        },
        {
          label: "Gestions des associations",
          icon: "pi pi-fw pi-slack",
          routerLink: ["/manager/association"],
        },
      ],
    };

    this.typeMenu == "manager";
    data = menuManager;

    this.model = [data];
  }
}
