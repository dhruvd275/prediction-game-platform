import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCreateEventPage } from './admin-create-event.page';

describe('AdminCreateEventPage', () => {
  let component: AdminCreateEventPage;
  let fixture: ComponentFixture<AdminCreateEventPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
