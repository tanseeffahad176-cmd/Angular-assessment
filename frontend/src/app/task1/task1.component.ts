import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
// Optional: You can use the ChartService from services/chart.service.ts instead of HttpClient directly
// import { ChartService, Chart } from '../services/chart.service';

// ⚠️ CRITICAL WARNING: DO NOT USE AI TOOLS
// This assessment must be completed WITHOUT using AI tools such as Cursor, ChatGPT, 
// GitHub Copilot, or any other AI coding assistants.
// If you use AI tools to complete this assessment, you will FAIL.

// TODO: Task 1 - Implement this component
// Requirements:
// 1. Fetch astrological charts from the API endpoint: GET /api/charts
// 2. Display the charts in a visually appealing card layout
// 3. Each card should show:
//    - Chart name
//    - Birth date, time, and location
//    - Sun sign, Moon sign, and Rising sign
//    - List of planets with their signs and degrees
// 4. Add loading state while fetching data
// 5. Handle error states gracefully
// 6. Make it responsive for mobile devices
// 7. Add some styling to make it look modern and professional
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

interface Chart {
  _id: string;
  name?: string;
  birthDate: string;      // ISO string
  birthTime: string;      // "HH:MM"
  birthLocation: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: Planets;
  notes?: string;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedChartsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Chart[];
  error?: string;
}

@Component({
  selector: 'app-task1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task1-page">
      <header class="header">
        <div>
          <h2>Astrological Charts</h2>
          <p class="subtitle">
            List of saved birth charts with sun, moon, rising and planet details.
          </p>
        </div>
      </header>

      <!-- loading -->
      <div *ngIf="isLoading" class="state state-loading">
        <div class="spinner"></div>
        <p>Loading charts...</p>
      </div>

      <!-- error -->
      <div *ngIf="!isLoading && errorMessage" class="state state-error">
        <p>{{ errorMessage }}</p>
        <button type="button" (click)="reload()">Try again</button>
      </div>

      <!-- empty -->
      <div *ngIf="!isLoading && !errorMessage && charts.length === 0" class="state state-empty">
        <p>No charts found.</p>
        <p class="hint">
          You can create a chart using
          <code>POST /api/charts/calculate</code>
          and it will show up here.
        </p>
      </div>

      <!-- cards -->
      <section *ngIf="!isLoading && !errorMessage && charts.length > 0" class="cards">
        <article class="card" *ngFor="let chart of charts; trackBy: trackById">
          <div class="card-header">
            <div>
              <h3>{{ chart.name || 'Birth Chart' }}</h3>
              <p class="location">{{ chart.birthLocation }}</p>
            </div>

            <div class="tags">
              <span class="tag tag-sun">☀ {{ chart.sunSign }}</span>
              <span
                *ngIf="chart.isPublic !== undefined"
                class="tag tag-public"
              >
                {{ chart.isPublic ? 'Public' : 'Private' }}
              </span>
            </div>
          </div>

          <div class="meta">
            <div>
              <label>Birth date</label>
              <span>{{ chart.birthDate | date: 'mediumDate' }}</span>
            </div>
            <div>
              <label>Birth time</label>
              <span>{{ chart.birthTime }}</span>
            </div>
          </div>

          <div class="highlights">
            <div class="highlight">
              <span class="highlight-label">Sun</span>
              <span class="highlight-value">{{ chart.sunSign }}</span>
            </div>
            <div class="highlight">
              <span class="highlight-label">Moon</span>
              <span class="highlight-value">{{ chart.moonSign }}</span>
            </div>
            <div class="highlight">
              <span class="highlight-label">Rising</span>
              <span class="highlight-value">{{ chart.risingSign }}</span>
            </div>
          </div>

          <div class="planets">
            <h4>Planets</h4>
            <ul>
              <li *ngFor="let key of planetKeys">
                <ng-container *ngIf="chart.planets && chart.planets[key] as planet">
                  <span class="planet-name">{{ key | titlecase }}</span>
                  <span class="planet-sign">{{ planet.sign }}</span>
                  <span class="planet-degree">
                    {{ planet.degree | number: '1.0-2' }}°
                  </span>
                </ng-container>
              </li>
            </ul>
          </div>

          <footer class="footer">
            <span *ngIf="chart.createdAt">
              {{ chart.createdAt | date: 'short' }}
            </span>
            <span *ngIf="chart.createdBy" class="created-by">
              • {{ chart.createdBy }}
            </span>
          </footer>
        </article>
      </section>
    </div>
  `,
  styles: [`
    .task1-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 16px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #050713;
      color: #f9fafb;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
      margin-bottom: 16px;
    }

    h2 {
      margin: 0 0 4px;
      font-size: 24px;
    }

    .subtitle {
      margin: 0;
      color: #9ca3af;
      font-size: 14px;
    }

    .state {
      max-width: 420px;
      margin: 32px auto 0;
      padding: 16px 20px;
      border-radius: 12px;
      text-align: center;
      font-size: 14px;
    }

    .state-loading {
      border: 1px solid rgba(156, 163, 175, 0.6);
      background: rgba(15, 23, 42, 0.8);
      color: #e5e7eb;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .state-error {
      border: 1px solid rgba(239, 68, 68, 0.8);
      background: rgba(127, 29, 29, 0.3);
      color: #fee2e2;
    }

    .state-empty {
      border: 1px dashed rgba(156, 163, 175, 0.7);
      background: rgba(15, 23, 42, 0.7);
      color: #e5e7eb;
    }

    .hint {
      margin-top: 4px;
      font-size: 12px;
      color: #9ca3af;
    }

    .state button {
      margin-top: 8px;
      padding: 6px 16px;
      border-radius: 999px;
      border: none;
      background: #fbbf24;
      color: #111827;
      font-weight: 500;
      cursor: pointer;
    }

    .state button:hover {
      background: #f59e0b;
    }

    .spinner {
      width: 26px;
      height: 26px;
      border-radius: 999px;
      border: 3px solid rgba(249, 250, 251, 0.2);
      border-top-color: #fbbf24;
      animation: spin 0.9s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
      margin-top: 20px;
    }

    .card {
      background: #0b1120;
      border-radius: 14px;
      padding: 12px;
      border: 1px solid rgba(31, 41, 55, 0.9);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 16px;
    }

    .location {
      margin: 2px 0 0;
      font-size: 12px;
      color: #9ca3af;
    }

    .tags {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }

    .tag {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    .tag-sun {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
    }

    .tag-public {
      background: rgba(15, 23, 42, 0.9);
      color: #e5e7eb;
      border: 1px solid rgba(156, 163, 175, 0.7);
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 12px;
      font-size: 12px;
      color: #9ca3af;
    }

    .meta div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .highlights {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .highlight {
      flex: 1 1 0;
      min-width: 70px;
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

    .planets h4 {
      margin: 4px 0 4px;
      font-size: 12px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .planets ul {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 150px;
      overflow-y: auto;
    }

    .planets li {
      display: grid;
      grid-template-columns: 1.2fr 1fr auto;
      font-size: 12px;
      padding: 2px 0;
      border-bottom: 1px dashed rgba(55, 65, 81, 0.7);
    }

    .planets li:last-child {
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

    .footer {
      margin-top: 4px;
      font-size: 11px;
      color: #9ca3af;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .created-by {
      opacity: 0.9;
    }

    @media (max-width: 640px) {
      .task1-page {
        padding: 12px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .meta {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class Task1Component implements OnInit {
  charts: Chart[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // change to '/api/charts' if you configure a proxy in vite.config
  private readonly apiUrl = 'http://localhost:3000/api/charts';

  // just a plain string array, simple and obvious
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

  page = 1;
  limit = 9;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCharts();
  }

  loadCharts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // keeping it simple: build query by hand instead of HttpParams
    const url = `${this.apiUrl}?page=${this.page}&limit=${this.limit}&sortBy=createdAt&sortOrder=desc`;

    this.http.get<PaginatedChartsResponse>(url).subscribe({
      next: (res) => {
        // basic defensive checks
        if (res && res.success) {
          this.charts = res.data || [];
        } else {
          this.errorMessage = res?.error || 'Could not load charts.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading charts', err);
        this.errorMessage = 'Failed to load charts. Please try again.';
        this.isLoading = false;
      }
    });
  }

  reload(): void {
    this.loadCharts();
  }

  trackById(_index: number, chart: Chart): string {
    return chart._id;
  }
}
