import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-modal',
  templateUrl: './loading-modal.component.html',
  styles: []
})
export class LoadingModalComponent implements OnInit {
  opened = false;

  constructor() { }

  ngOnInit() {
  }

  show() {
    // setTimeout(() => {
    //   this.opened = true;
    // }, time);
    this.opened = true;
  }

  hide(time: number = 1000) {
    setTimeout(() => {
      this.opened = false;
    }, time);
  }

}
