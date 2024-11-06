import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { ConfirmationService, MessageService } from "primeng/api";
import { ServiceService } from "../../services/service.service";
import { NgxSpinnerService } from "ngx-spinner";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { AlertService } from "../../services/alert.service";
interface expandedRows {
  [key: string]: boolean;
}
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: "app-gestion-pub",
  templateUrl: "./gestion-pub.component.html",
  styleUrls: ["./gestion-pub.component.css"],
})
export class GestionPubComponent implements OnInit {
  expandedRows: expandedRows = {};
  environments: any;
  skeleton: boolean = true;
  checkDetails: boolean = false;
  ajouterDoc: boolean = false;
  pathUrl: string;
  url : string;
  isFileUploaded:boolean=false;

  keyWord : string="";
  dataNumberShow: number= 10;
  offset:number=0;
  limit:number= this.dataNumberShow;
  currentPage=1;
  totalPages=0;
  f: any[] = [];

  associations: any[] = [];
  detailAssoc = {
    id: 0,
    name: "",
    desc: ""
  }
  detailPub = {
    id:0,
    titre: "",
    link: "",
    is_active: 0, 
  };
  selectedFile: File | null = null;
  isAdmin = [
    { name: "Admin", value: 1 },
    { name: "Client", value: 0 },
  ];
  isValid = [
    { status: true, value: 1 },
    { status: false, value: 0 },
  ];
  isValidUpdate = [
    { status: true, value: 1 },
    { status: false, value: 0 },
  ];
  checked: boolean = false;
  disableUpdate: boolean = false;
  pubBody = {
    titre: "",
    link: "", 
    is_active:0
  };
  modalCreateUser: boolean = false;
  addContrat: boolean = false;
 
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceService: ServiceService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private router: Router,
    private statusService : AlertService
  ) {
    this.pathUrl = environment.PATH_URL;
    this.url = "http://localhost:8000/api/upload_logo"
  }

  ngOnInit() {
    this.environments = environment;
    this.getAllAssociations();
  }
  uploadFiles() {
    if (this.selectedFile) {
      console.log('Uploading file:', this.selectedFile)
      this.serviceService.upload_logo(this.detailAssoc).subscribe(
        (data: any) => {
          console.log(data)
        }
      )
    } else {
      console.log('Aucun fichier sélectionné pour l’upload');
    }
  }

  showModalCreateUser() {
    this.clearForm();
    this.modalCreateUser = true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

openUrl(event: MouseEvent,url: string) {
  event.preventDefault(); 
  if(url=="path")
    {
      this.messageService.add({
        severity: "error",
            summary: "",
            detail: "Cette publicité n'a pas d'image",
      });
      return;
    }
   window.open(this.pathUrl + url, "_blank");
}
openLink(event: MouseEvent,url: string)
{
  window.open(url, "_blank");
}
getFileUpload(event:UploadEvent) {
  if(event.files.length>1){
    this.messageService.add({
      severity: "error",
          summary: "",
          detail: "Vous ne pouvez sélectionner qu'un seul fichier.",
    });
    this.f = [];
    return;
  }
  for(let file of event.files) {
      this.f.push(file);
  }
 this.setFileDisabled();
} 
onCancel(){
  this.f = [];
  this.setFileDisabled();
}
removeFile(file: any) {
  const index = this.f.indexOf(file);
  if (index !== -1) {
    this.f.splice(index, 1);
  }
  this.setFileDisabled();
}
setFileDisabled(){
  if(this.f.length>=1){
    this.isFileUploaded=true;
  }else{
    this.isFileUploaded=false;
  } 
}
getDetailsPub(id: any) {
  this.checkDetails = true;
  this.serviceService.getDetailsPub(id).subscribe((data: any) => {
    this.detailPub = data.pub;
    this.checked = this.detailPub.is_active=== 1;
  });
}

getDetailsAssoc(id: any) {
  this.checkDetails = true
  this.serviceService.getDetailsAssoc(id).subscribe(
    (data: any ) => {
      this.detailAssoc = data.associations[0]
    }
  )
}
getFilePath(file: string): string {
  return file.includes("public/") ? file.split("public/")[1] : file;
}
getFileType(file: string) {
  return file.split(".")[1];
}

openModal(id: any) {
  this.pubBody.titre = "";
  this.pubBody.link = "";
}
isLink(link: string): boolean {
  if(link==null){
    return true
  }
  return link.startsWith('http://') || link.startsWith('https://');
}
getImageType(path:any)
{
    return path.split(".")[1];
}

onUploadUpdate() {
  if (this.detailAssoc.name === "" || this.detailAssoc.desc === "") {
    this.messageService.add({
      severity: "error",
          summary: "",
          detail: "Champ manquant",
    });
    return;
  }
  if (this.f.length ==0 || this.f.length>1) {
    this.messageService.add({
      severity: "error",
          summary: "",
          detail: "Mettre une image",
    });
    return;
  }
  // if(this.f.length>1){
  //   this.messageService.add({
  //     severity: "error",
  //         summary: "",
  //         detail: "Mettre une image",
  //   });
  //   return;
  // }else if (this.f.length ==0) { 
  //   this.disableUpdate = true;
  //   this.spinner.show("spinnerLoader");
  //   this.serviceService.updatePublicity(this.detailPub).subscribe(() => {
  //     this.getAllAssociations();
  //     this.f = [];
  //     this.clearDetail();
  //     this.checkDetails = false;
  //     this.disableUpdate = false;
  //     this.messageService.add({
  //       severity: "success",
  //       summary: "Publicité modifiée avec succès",
  //       detail: "",
  //     });
  //     this.spinner.hide("spinnerLoader");
  //   },
  //   (error) => {
  //     let status = this.statusService.getStatus();
  //     this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
  //     this.spinner.hide("spinnerLoader");
  //     return;
  //   }
  //   );
  // }else if (this.f.length ==1) { 
  //   const uploadData = new FormData();
  //   for (let i = 0; i < this.f.length; i++) {
  //     uploadData.append("fichier[]", this.f[i], this.f[i].name);
  //   }
  
  //   this.spinner.show("spinnerLoader");
  //   this.serviceService.upload(uploadData).subscribe(
  //     (data) => {
  //       if (data.message === "success") {
  //         for (let index = 0; index < data.paths.length; index++) {
  //           var body = {
  //             id:this.detailPub.id,
  //             titre: this.detailPub.titre,
  //             path: this.getFilePath(data.paths[index]),
  //             link: this.detailPub.link, 
  //             type: this.getImageType(this.getFilePath(data.paths[index])),
  //             is_active:this.detailPub.is_active
  //           };
  
  //           this.serviceService.updatePublicity(body).subscribe(() => {
  //             this.getAllAssociations();
  //             this.f = [];
  //             this.clearDetail();
  //             this.checkDetails = false;
  //             this.disableUpdate = false;
  //             this.messageService.add({
  //               severity: "success",
  //               summary: "Publicité modifiée avec succès",
  //               detail: "",
  //             });
  //             this.spinner.hide("spinnerLoader");
  //           },
  //           (error) => {
  //             let status = this.statusService.getStatus();
  //             this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
  //             this.spinner.hide("spinnerLoader");
  //             return;
  //           }
  //           );
  //         }
  //       }
  //     },
  //     (error) => {
  //       let status = this.statusService.getStatus();
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
  //     }
  //   );
  // }
  const uploadData = new FormData();
    for (let i = 0; i < this.f.length; i++) {
      uploadData.append("fichier[]", this.f[i], this.f[i].name);
    }
  
    this.spinner.show("spinnerLoader");
    this.serviceService.upload(uploadData).subscribe(
      (data) => {
        if (data.message === "success") {
          for (let index = 0; index < data.paths.length; index++) {
            var body = {
              id: this.detailAssoc.id,
              name: this.detailAssoc.name,
              desc:this.detailAssoc.desc,
              logo: this.getFilePath(data.paths[index])
            };
            // console.log(body);
            this.serviceService.updateAssociation(body).subscribe(
              () => {
                this.getAllAssociations();
                this.f = [];
                this.ajouterDoc = false;
                this.spinner.hide("spinnerLoader");
                this.clearForm();
                this.modalCreateUser = false;
                this.messageService.add({
                  severity: "success",
                  summary: "Association modifiée",
                  detail: "",
                });
              },
              (error) => {
                let status = this.statusService.getStatus();
                this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
                this.spinner.hide("spinnerLoader");
              }
            );
          }
        }
      },
      (error) => {
        let status = this.statusService.getStatus();
        this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
      }
    ); 

  } 
onUpload() {
  if (this.detailAssoc.name === "" || this.detailAssoc.desc === "") {
    this.messageService.add({
      severity: "error",
          summary: "",
          detail: "Champ manquant",
    });
    return;
  }
 
 
  if (this.f.length ==0 || this.f.length>1) {
    this.messageService.add({
      severity: "error",
          summary: "",
          detail: "Mettre une image",
    });
    return;
  }
  
    const uploadData = new FormData();
    for (let i = 0; i < this.f.length; i++) {
      uploadData.append("fichier[]", this.f[i], this.f[i].name);
    }
  
    this.spinner.show("spinnerLoader");
    this.serviceService.upload(uploadData).subscribe(
      (data) => {
        if (data.message === "success") {
          for (let index = 0; index < data.paths.length; index++) {
            var body = {
              name: this.detailAssoc.name,
              desc:this.detailAssoc.desc,
              logo: this.getFilePath(data.paths[index])
            };
            this.serviceService.registerAssociation(body).subscribe(
              () => {
                this.getAllAssociations();
                this.f = [];
                this.ajouterDoc = false;
                this.spinner.hide("spinnerLoader");
                this.clearForm();
                this.modalCreateUser = false;
                this.messageService.add({
                  severity: "success",
                  summary: "Association ajoutée",
                  detail: "",
                });
              },
              (error) => {
                let status = this.statusService.getStatus();
                this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
                this.spinner.hide("spinnerLoader");
              }
            );
          }
        }
      },
      (error) => {
        let status = this.statusService.getStatus();
        this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
      }
    );
} 

  clearForm() {
    this.pubBody.titre = "";
    this.pubBody.link = "";
    this.isFileUploaded=false;
   this.pubBody.is_active = 0;
   this.f = [];
  }

  clearDetail() {
    this.detailPub.titre = "";
    this.detailPub.link = "";
   this.detailPub.is_active = 0;
   this.isFileUploaded=false;
  }

  searchAssociations(key)
  {
      this.keyWord=key;
      this.offset=0;
      this.limit= this.dataNumberShow;
      this.getAllAssociations();
      this.currentPage = 1
  }

  getPageNumbers(): void {
    const pageCount = Math.ceil(this.totalPages / this.dataNumberShow);
    this.totalPages=pageCount;
  }

  changePage(newPage: any) {
    if (newPage >= 1 && newPage <= this.totalPages) {

      this.currentPage=newPage;
      this.offset=(this.dataNumberShow*(newPage-1));
      this.limit= this.dataNumberShow;

    this.getAllAssociations();
    }
  }

  getAllAssociations() {
    const body = {
      key: this.keyWord,
      offset: this.offset,
      limit: this.limit
    }
    
    this.serviceService.getAssociations(body).subscribe((data: any) => {
      this.associations = data.associations;
      this.totalPages=data.associationCount;
      this.getPageNumbers();
      this.skeleton = false;
    },
    (error) => {
      let status = this.statusService.getStatus();
      this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
    }
    );
  }
  oneCheckValid(value: any) {
    if (value) {
      this.pubBody.is_active = 1;
     
    } else {
      this.pubBody.is_active = 0;
    }
    const foundItem = this.isValid.find((item) => item.value === value);
    this.checked = foundItem.status;
  }

  oneCheckValidUpdate(value: any) {
    if (value) {
      this.detailPub.is_active = 1;
     
    } else {
      this.detailPub.is_active = 0;
    }
    const foundItem = this.isValidUpdate.find((item) => item.value === value);
    this.checked = foundItem.status;
  }
  
  deletePublicitie(id: any, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Etes-vous sur de supprimer cette association?",
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
        this.serviceService.deleteAssociation(id).subscribe(() => {
          this.messageService.add({
            severity: "info",
            summary: "Confirmé",
            detail: "Association supprimée",
          });
          this.getAllAssociations();
          this.spinner.hide("spinnerLoader");
        },
        (error)=>{
          let status = this.statusService.getStatus();
          this.messageService.add({ severity: 'error', summary: 'Error', detail:  status });
        }
        );
      },
      reject: () => {

      },
    });
  }

  hideAjoutServicePopup() {
    this.checkDetails = false;
  }
}
