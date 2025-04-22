import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeEditDialogComponent } from './employee-edit-dialog.component';

describe('EmployeeEditDialogComponent', () => {
  let component: EmployeeEditDialogComponent;
  let fixture: ComponentFixture<EmployeeEditDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeEditDialogComponent]
    });
    fixture = TestBed.createComponent(EmployeeEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
