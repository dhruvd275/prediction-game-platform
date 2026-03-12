import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMarketsPage } from './admin-markets.page';

describe('AdminMarketsPage', () => {
  let component: AdminMarketsPage;
  let fixture: ComponentFixture<AdminMarketsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMarketsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
