import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Optional: You can use the ChartService from services/chart.service.ts instead of HttpClient directly
// import { ChartService, Chart, CalculateChartRequest } from '../services/chart.service';

// ⚠️ CRITICAL WARNING: DO NOT USE AI TOOLS
// This assessment must be completed WITHOUT using AI tools such as Cursor, ChatGPT, 
// GitHub Copilot, or any other AI coding assistants.
// If you use AI tools to complete this assessment, you will FAIL.

// TODO: Task 2 - Implement this component
// Requirements:
// 1. Create a form with the following fields:
//    - Birth Date (date picker)
//    - Birth Time (time input)
//    - Birth Location (text input)
// 2. Validate all fields are required
// 3. On form submission, send POST request to /api/charts/calculate
// 4. Display the calculated chart result in a nice format
// 5. Show loading state during API call
// 6. Handle errors appropriately
// 7. Reset form after successful submission
// 8. Add form validation messages
// 9. Make the form responsive and user-friendly
//
// Note: A ChartService is available in services/chart.service.ts if you prefer to use it


interface Planet {
  sign: string;
  degree: number;
}

interface Planets {
  sun: Planet;
  moon: Planet;
  mercury: Planet;
  venus: Planet;
  mars: Planet;
  jupiter: Planet;
  saturn: Planet;
  uranus: Planet;
  neptune: Planet;
  pluto: Planet;
}

interface ChartResult {
  _id: string;
  name?: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: Planets;
  notes?: string;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: string;
}

interface CalculateResponse {
  success: boolean;
  data: ChartResult;
  error?: string;
}

@Component({
  selector: 'app-task2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="task2-page">
      <h2>Birth Chart Calculator</h2>
      <p class="description">
        Enter birth details to calculate an astrological chart.
      </p>

      <section class="form-card">
        <form [formGroup]="chartForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="birthDate">Birth date</label>
            <input
              id="birthDate"
              type="date"
              formControlName="birthDate"
            />
            <div class="error" *ngIf="isInvalid('birthDate')">
              Birth date is required.
            </div>
          </div>

          <div class="field">
            <label for="birthTime">Birth time</label>
            <input
              id="birthTime"
              type="time"
              formControlName="birthTime"
            />
            <div class="error" *ngIf="isInvalid('birthTime')">
              Birth time is required.
            </div>
          </div>

          <div class="field">
            <label for="birthLocation">Birth location</label>
            <input
              id="birthLocation"
              type="text"
              placeholder="City, Country"
              formControlName="birthLocation"
            />
            <div class="error" *ngIf="isInvalid('birthLocation')">
              Birth location is required (min 2 characters).
            </div>
          </div>

          <!-- TODO: add latitude / longitude later if needed -->

          <button type="submit" [disabled]="isSubmitting">
            <span *ngIf="!isSubmitting">Calculate chart</span>
            <span *ngIf="isSubmitting" class="btn-loading">
              <span class="tiny-spinner"></span>
              Calculating...
            </span>
          </button>

          <div class="message message-error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="message message-success" *ngIf="successMessage">
            {{ successMessage }}
          </div>
        </form>
      </section>

      <!-- result card -->
      <section *ngIf="result" class="result-card">
        <h3>{{ result.name || 'Calculated Chart' }}</h3>

        <div class="result-meta">
          <div>
            <label>Birth date</label>
            <span>{{ result.birthDate | date: 'mediumDate' }}</span>
          </div>
          <div>
            <label>Birth time</label>
            <span>{{ result.birthTime }}</span>
          </div>
          <div>
            <label>Location</label>
            <span>{{ result.birthLocation }}</span>
          </div>
        </div>

        <div class="result-highlights">
          <div class="highlight">
            <span class="highlight-label">Sun</span>
            <span class="highlight-value">{{ result.sunSign }}</span>
          </div>
          <div class="highlight">
            <span class="highlight-label">Moon</span>
            <span class="highlight-value">{{ result.moonSign }}</span>
          </div>
          <div class="highlight">
            <span class="highlight-label">Rising</span>
            <span class="highlight-value">{{ result.risingSign }}</span>
          </div>
        </div>

        <div class="result-planets">
          <h4>Planets</h4>
          <ul>
            <li *ngFor="let key of planetKeys">
              <ng-container *ngIf="result.planets && result.planets[key] as planet">
                <span class="planet-name">{{ key | titlecase }}</span>
                <span class="planet-sign">{{ planet.sign }}</span>
                <span class="planet-degree">
                  {{ planet.degree | number: '1.0-2' }}°
                </span>
              </ng-container>
            </li>
          </ul>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .task2-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 16px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #050713;
      color: #f9fafb;
      min-height: 100vh;
    }

    h2 {
      margin: 0 0 4px;
      font-size: 24px;
    }

    .description {
      margin: 0 0 16px;
      color: #9ca3af;
      font-size: 14px;
    }

    .form-card {
      background: #0b1120;
      border-radius: 14px;
      padding: 16px 18px;
      border: 1px solid rgba(31, 41, 55, 0.9);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      margin-bottom: 20px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    label {
      font-size: 13px;
      font-weight: 500;
    }

    input {
      border-radius: 8px;
      border: 1px solid rgba(55, 65, 81, 0.9);
      background: rgba(15, 23, 42, 0.9);
      color: #f9fafb;
      padding: 6px 8px;
      font-size: 13px;
      outline: none;
    }

    input:focus {
      border-color: #fbbf24;
      box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.4);
    }

    .error {
      font-size: 11px;
      color: #fecaca;
    }

    button[type="submit"] {
      margin-top: 4px;
      align-self: flex-start;
      padding: 6px 18px;
      border-radius: 999px;
      border: none;
      background: #fbbf24;
      color: #111827;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    button[disabled] {
      opacity: 0.7;
      cursor: default;
    }

    .btn-loading {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .tiny-spinner {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      border: 2px solid rgba(15, 23, 42, 0.2);
      border-top-color: #111827;
      background: rgba(249, 250, 251, 0.85);
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .message {
      margin-top: 4px;
      font-size: 12px;
    }

    .message-error {
      color: #fecaca;
    }

    .message-success {
      color: #bbf7d0;
    }

    .result-card {
      background: #0b1120;
      border-radius: 14px;
      padding: 16px 18px;
      border: 1px solid rgba(31, 41, 55, 0.9);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    .result-card h3 {
      margin: 0 0 8px;
      font-size: 18px;
    }

    .result-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 8px 16px;
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 12px;
    }

    .result-meta label {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .result-highlights {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }

    .highlight {
      flex: 1 1 0;
      min-width: 80px;
      padding: 6px 8px;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(55, 65, 81, 0.9);
    }

    .highlight-label {
      font-size: 11px;
      color: #9ca3af;
    }

    .highlight-value {
      font-size: 13px;
      font-weight: 600;
    }

    .result-planets h4 {
      margin: 4px 0 4px;
      font-size: 12px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .result-planets ul {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 160px;
      overflow-y: auto;
    }

    .result-planets li {
      display: grid;
      grid-template-columns: 1.2fr 1fr auto;
      font-size: 12px;
      padding: 2px 0;
      border-bottom: 1px dashed rgba(55, 65, 81, 0.7);
    }

    .result-planets li:last-child {
      border-bottom: none;
    }

    .planet-name {
      font-weight: 500;
    }

    .planet-sign {
      text-align: center;
      color: #fbbf24;
    }

    .planet-degree {
      text-align: right;
      color: #9ca3af;
    }

    @media (max-width: 640px) {
      .task2-page {
        padding: 12px;
      }
    }
  `]
})
export class Task2Component {
  chartForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  result: ChartResult | null = null;

  private readonly apiUrl = 'http://localhost:3000/api/charts/calculate';

  planetKeys: (keyof Planets)[] = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.chartForm = this.fb.group({
      birthDate: ['', Validators.required],
      birthTime: ['', Validators.required],
      birthLocation: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.chartForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.chartForm.invalid) {
      this.chartForm.markAllAsTouched();
      return;
    }

    const payload = {
      birthDate: this.chartForm.value.birthDate,
      birthTime: this.chartForm.value.birthTime,
      birthLocation: this.chartForm.value.birthLocation,
      // other fields are optional per API docs, skipping for now
    };

    this.isSubmitting = true;
    this.result = null;

    this.http.post<CalculateResponse>(this.apiUrl, payload).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.result = res.data;
          this.successMessage = 'Chart calculated successfully.';
          console.log('Calculated chart:', this.result); // just to see what backend returns
          this.chartForm.reset();
        } else {
          this.errorMessage = res?.error || 'Failed to calculate chart.';
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error calculating chart', err);
        this.errorMessage = 'Something went wrong. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
