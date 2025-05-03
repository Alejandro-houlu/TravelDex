import { Component, ElementRef, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { TopbarComponent } from "../topbar/topbar.component";
import { MenuItem } from './menu.model';
import { Router, RouterModule } from '@angular/router';
import { MENU } from './menu';
import { SimplebarAngularModule } from 'simplebar-angular';
import { CommonModule } from '@angular/common';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NgbCollapse, RouterModule, SimplebarAngularModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  menu: any;
  toggle: any = true;
  menuItems: MenuItem[] = [];
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  constructor(private router: Router){}

  ngOnInit(): void {
    this.menuItems = MENU
  }
  toggleItem(item: any) {
  this.menuItems.forEach((menuItem: any) => {

    if (menuItem == item) {
      menuItem.isCollapsed = !menuItem.isCollapsed
    } else {
      menuItem.isCollapsed = true
    }
    if (menuItem.subItems) {
      menuItem.subItems.forEach((subItem: any) => {

        if (subItem == item) {
          menuItem.isCollapsed = !menuItem.isCollapsed
          subItem.isCollapsed = !subItem.isCollapsed
        } else {
          subItem.isCollapsed = true
        }
        if (subItem.subItems) {
          subItem.subItems.forEach((childitem: any) => {

            if (childitem == item) {
              childitem.isCollapsed = !childitem.isCollapsed
              subItem.isCollapsed = !subItem.isCollapsed
              menuItem.isCollapsed = !menuItem.isCollapsed
            } else {
              childitem.isCollapsed = true
            }
            if (childitem.subItems) {
              childitem.subItems.forEach((childrenitem: any) => {

                if (childrenitem == item) {
                  childrenitem.isCollapsed = false
                  childitem.isCollapsed = false
                  subItem.isCollapsed = false
                  menuItem.isCollapsed = false
                } else {
                  childrenitem.isCollapsed = true
                }
              })
            }
          })
        }
      })
    }
  });
}

 activateParentDropdown(item: any) {
    item.classList.add("active");
    let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  removeActivation(items: any) {
    items.forEach((item: any) => {
      item.classList.remove("active");
    });
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }

  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute("data-sidebar-size");
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover');

    } else {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover-active')
    }
  }

}
