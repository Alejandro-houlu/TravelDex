import { NgModule } from "@angular/core";
import { BreadcrumbsComponent } from "./breadcrumbs/breadcrumbs.component";
import { CommonModule } from "@angular/common";
import { NgbNavModule, NgbAccordionModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    declarations: [
        BreadcrumbsComponent
    ],
    imports: [
        CommonModule,
        NgbNavModule,
        NgbAccordionModule,
        NgbDropdownModule
    ],
    exports:[
        BreadcrumbsComponent
    ]
})
export class SharedModule{}