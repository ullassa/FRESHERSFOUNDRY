import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlogsComponent } from './blogs.component';

describe('BlogsComponent', () => {
  let fixture: ComponentFixture<BlogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogsComponent, HttpClientTestingModule, RouterTestingModule.withRoutes([])]
    }).compileComponents();

    fixture = TestBed.createComponent(BlogsComponent);
    fixture.detectChanges();
  });

  it('renders the blogs page heading and search filter', () => {
    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading?.textContent).toContain('Blogs');
    expect(fixture.nativeElement.textContent).toContain('Search');
  });

  it('shows the loading and empty states when no posts are returned', () => {
    const component = fixture.componentInstance;

    component.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading');

    component.loading.set(false);
    component.items.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No blogs published yet');
  });
});
