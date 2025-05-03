import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent implements OnInit {

  @Input() title: string | undefined;
  @Input()
  breadcrumbItems!: {
    active?: boolean,
    label?: string
  }[]

  constructor() {}

  ngOnInit(): void {
  }
}
