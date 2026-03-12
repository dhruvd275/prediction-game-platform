import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditLogPage } from './credit-log.page';

describe('CreditLogPage', () => {
  let component: CreditLogPage;
  let fixture: ComponentFixture<CreditLogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
