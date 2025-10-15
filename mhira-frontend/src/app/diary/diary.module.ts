import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { DiaryMainComponent } from './components/diary-main/diary-main.component';
import { DiaryService } from './services/diary.service';

const routes: Routes = [
  {
    path: '',
    component: DiaryMainComponent,
    data: {
      title: 'Diário do Cuidador'
    }
  }
];

@NgModule({
  declarations: [
    DiaryMainComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    DiaryService
  ]
})
export class DiaryModule { }
