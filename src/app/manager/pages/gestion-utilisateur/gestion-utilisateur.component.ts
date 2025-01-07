import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from "primeng/api";
import { ServiceService } from "../../services/service.service";
import { NgxSpinnerService } from "ngx-spinner";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { AlertService } from "../../services/alert.service";
interface expandedRows {
  [key: string]: boolean;
}

@Component({
  selector: "app-gestion-services",
  templateUrl: "./gestion-utilisateur.component.html",
  styleUrls: ["./gestion-utilisateur.component.css"],
})
export class GestionServicesComponent implements OnInit {
  expandedRows: expandedRows = {};
  environments: any;
  skeleton: boolean = true;
  checkDetailsUsers: boolean = false;

  keyWord: string = "";
  dataNumberShow: number = 10;
  offset: number = 0;
  limit: number = this.dataNumberShow;
  currentPage = 1;
  totalPages = 0;

  lastValisation: number = 2;

  users: any[] = [];
  detailUser = {
    first_name: "",
    last_name: "",
    email: "",
    is_admin: "",
    is_valid: 0,
    association_id: null,
    level_id: null,
    title: "Status du compte",
    path: "path",
    message: "",
    status: 0,
  };
  isAdmin = [
    { name: "Admin", value: 1 },
    { name: "Client", value: 0 },
  ];
  isValid = [
    { status: true, value: 1 },
    { status: false, value: 0 },
  ];

  checked: boolean = false;
  //disableUpdate: boolean = false;
  userBody = {
    first_name: "",
    last_name: "",
    email: "",
    association_id: null,
    level_id: 1,
    is_admin: null,
  };
  modalCreateUser: boolean = false;
  associations: any[] = [];
  niveaux: any[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceService: ServiceService,
    private spinner: NgxSpinnerService,
    private primengConfig: PrimeNGConfig,
    private statusService: AlertService
  ) {}

  ngOnInit() {
    this.environments = environment;
    this.getAllUsers();
    this.showAssociation();
    this.showLevel();

    this.primengConfig.setTranslation({
      monthNames: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ],
      dayNamesMin: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    });
  }

  showAssociation() {
    this.serviceService.getAllAssociations().subscribe((reponse: any) => {
      this.associations = reponse.associations;
    });
  }

  showLevel() {
    this.serviceService.getAllLevel().subscribe((reponse: any) => {
      this.niveaux = reponse.niveau;
    });
  }

  showModalCreateUser() {
    this.clearForm();
    this.modalCreateUser = true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get status(): boolean {
    return this.detailUser?.status === 1;
  }

  set status(value: boolean) {
    if (this.detailUser) {
      this.detailUser.status = value ? 1 : 0;
    }
  }

  validateForm(): string[] {
    const errors: string[] = [];
    if (!this.userBody.association_id) {
      errors.push("L'association doit être sélectionnée.");
    }
    return errors;
  }

  createUser() {
    const validationErrors = this.validateForm();
    if (
      this.userBody.last_name === "" ||
      this.userBody.first_name === "" ||
      this.userBody.email === "" ||
      validationErrors.length > 0
    ) {
      this.messageService.add({
        severity: "error",
        summary: "Erreur",
        detail: "Veuillez remplir tous les champs",
      });
      return;
    }
    if (!this.isValidEmail(this.userBody.email)) {
      this.messageService.add({
        severity: "error",
        summary: "Erreur",
        detail: "Format de l'email invalide",
      });
      return;
    }
    this.create();
  }

  create() {
    this.spinner.show("spinnerLoader");
    this.serviceService.registerUser(this.userBody).subscribe(
      () => {
        this.messageService.add({
          severity: "success",
          summary: "Enregistré",
          detail: "Client enregistré avec success",
        });
        this.getAllUsers();
        this.modalCreateUser = false;
        this.clearForm();
        this.spinner.hide("spinnerLoader");
      },
      (error) => {
        let status = this.statusService.getStatus();
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: status,
        });
        this.spinner.hide("spinnerLoader");
        return;
      }
    );
  }
  clearForm() {
    this.userBody.first_name = "";
    this.userBody.last_name = "";
    this.userBody.email = "";
    this.userBody.is_admin = 0;
    this.userBody.association_id = "";
    this.userBody.level_id = 1;
    this.checked = false;
  }

  oneCheckAdmin(value: any) {
    const foundItem = this.isAdmin.find((item) => item.value === value);
    return foundItem ? foundItem.name : false;
  }

  oneCheckValid(value: any) {
    if (value) {
      this.detailUser.is_valid = 1;
    } else {
      this.detailUser.is_valid = 0;
    }
    const foundItem = this.isValid.find((item) => item.value === value);
    this.checked = foundItem.status;
  }

  searchUsers(key) {
    this.keyWord = key;
    this.offset = 0;
    this.limit = this.dataNumberShow;
    this.getAllUsers();
    this.currentPage = 1;
  }

  getPageNumbers(): void {
    const pageCount = Math.ceil(this.totalPages / this.dataNumberShow);
    this.totalPages = pageCount;
  }

  changePage(newPage: any) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.offset = this.dataNumberShow * (newPage - 1);
      this.limit = this.dataNumberShow;

      this.getAllUsers();
    }
  }
  getAllUsers() {
    try {
      const body = {
        key: this.keyWord,
        offset: this.offset,
        limit: this.limit,
      };

      this.serviceService.getAllUsers(body).subscribe(
        (data: any) => {
          this.users = data.users;
          this.totalPages = data.userCount;
          this.getPageNumbers();
          this.skeleton = false;
        },
        (error) => {
          let status = this.statusService.getStatus();
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: status,
          });
          return;
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  getDEtailsUsers(id: any) {
    this.lastValisation = 2;
    this.checkDetailsUsers = true;
    this.serviceService.getDetailsUsers(id).subscribe((data: any) => {
      this.detailUser = data.clients[0];
      this.userBody = this.detailUser;
      this.checked = this.detailUser.is_valid === 1;
      this.lastValisation = this.detailUser.is_valid;
    });
  }

  deleteUser(id: any, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Etes-vous sur de supprimer cet utilisateur?",
      header: "Confirmation",
      icon: "pi pi-info-circle",
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Oui",
      rejectLabel: "Non",

      accept: () => {
        this.spinner.show("spinnerLoader");
        this.serviceService.deleteUsers(id).subscribe(
          () => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmé",
              detail: "Utilisateur supprimé",
            });
            this.getAllUsers();
            this.spinner.hide("spinnerLoader");
          },
          (error) => {
            this.spinner.hide("spinnerLoader");
            let status = this.statusService.getStatus();
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: status,
            });
            return;
          }
        );
      },
      reject: () => {},
    });
  }

  updateUser(event: Event) {
    const validationErrors = this.validateForm();
    if (
      this.detailUser.last_name === "" ||
      this.detailUser.first_name === "" ||
      this.detailUser.email === "" ||
      validationErrors.length > 0
    ) {
      this.messageService.add({
        severity: "error",
        summary: "Erreur",
        detail: "Veuillez remplir tous les champs",
      });
      return;
    }
    if (!this.isValidEmail(this.detailUser.email)) {
      this.messageService.add({
        severity: "error",
        summary: "Erreur",
        detail: "Format de l'email invalide",
      });
      return;
    }
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Voulez vous vraiment modifier",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        if (this.lastValisation != this.detailUser.is_valid) {
        } else {
          this.spinner.show("spinnerLoader");
          console.log(this.userBody);
          this.serviceService.updateUser(this.userBody).subscribe(
            () => {
              this.getAllUsers();
              this.checkDetailsUsers = false;
              this.spinner.hide("spinnerLoader");
              this.messageService.add({
                severity: "success",
                summary: "Utilisateur modifié avec succès",
                detail: "",
              });
            },
            (error) => {
              let status = this.statusService.getStatus();
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: status,
              });
              this.spinner.hide("spinnerLoader");
              return;
            }
          );
        }
      },
      reject: () => {
        this.checkDetailsUsers = false;
        return;
      },
    });
  }

  hideAjoutServicePopup() {
    this.checkDetailsUsers = false;
  }
}
