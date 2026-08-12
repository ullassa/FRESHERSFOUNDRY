import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { InterviewQuestionsComponent } from './interview-questions.component';

describe('InterviewQuestionsComponent', () => {
  let fixture: ComponentFixture<InterviewQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewQuestionsComponent, HttpClientTestingModule, RouterTestingModule.withRoutes([])]
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewQuestionsComponent);
    fixture.detectChanges();
  });

  it('renders the question list and filter controls', () => {
    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading?.textContent).toContain('Interview Questions');
    expect(fixture.nativeElement.textContent).toContain('Category');
    expect(fixture.nativeElement.textContent).toContain('Difficulty');
  });

  it('shows an API error state when loading fails', () => {
    fixture.componentInstance.error.set('Unable to load questions right now.');
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unable to load questions right now.');
  });
});
