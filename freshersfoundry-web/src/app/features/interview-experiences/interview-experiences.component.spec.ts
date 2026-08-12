import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { InterviewExperiencesComponent } from './interview-experiences.component';

describe('InterviewExperiencesComponent', () => {
  let fixture: ComponentFixture<InterviewExperiencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewExperiencesComponent, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewExperiencesComponent);
    fixture.detectChanges();
  });

  it('renders the experience create form and validation states', () => {
    const form = fixture.componentInstance.form;
    expect(form).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Share your experience');

    form.markAllAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Company is required');
  });

  it('shows the submit state while the request is in flight', () => {
    fixture.componentInstance.submitting.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Submitting');
  });
});
