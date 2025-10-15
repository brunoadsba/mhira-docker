import { Component, OnInit } from '@angular/core';
import { DiaryService } from '../../services/diary.service';
import { DiaryEntry, DiaryStats, DiaryInsight } from '../../models/diary-entry.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-diary-main',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="diary-container">
      <!-- Header -->
      <div class="diary-header">
        <h1>Diário do Cuidador</h1>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openNewEntryModal()">
            <i class="fas fa-plus"></i> Nova Entrada
          </button>
          <button class="btn btn-secondary" (click)="refreshData()">
            <i class="fas fa-sync"></i> Atualizar
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-day"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalEntries }}</h3>
            <p>Entradas no Diário</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stress">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.averageStressLevel | number:'1.1-1' }}</h3>
            <p>Nível de Estresse</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon sleep">
            <i class="fas fa-bed"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.averageSleepQuality | number:'1.1-1' }}</h3>
            <p>Qualidade do Sono</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon medication">
            <i class="fas fa-pills"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.medicationAdherenceRate | number:'1.0-0' }}%</h3>
            <p>Adesão à Medicação</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Ações Rápidas</h3>
        <div class="action-buttons">
          <button class="action-btn" (click)="quickEntry('medication')">
            <i class="fas fa-pills"></i>
            <span>Medicação</span>
          </button>
          <button class="action-btn" (click)="quickEntry('mood')">
            <i class="fas fa-smile"></i>
            <span>Humor</span>
          </button>
          <button class="action-btn" (click)="quickEntry('symptom')">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Sintoma</span>
          </button>
          <button class="action-btn" (click)="quickEntry('event')">
            <i class="fas fa-calendar-plus"></i>
            <span>Evento</span>
          </button>
        </div>
      </div>

      <!-- Insights -->
      <div class="insights-section" *ngIf="unreadInsights.length > 0">
        <h3>Insights da IA</h3>
        <div class="insights-grid">
          <div 
            *ngFor="let insight of unreadInsights" 
            class="insight-card"
            [ngClass]="getInsightTypeClass(insight.insightType)"
          >
            <div class="insight-header">
              <h4>{{ insight.title }}</h4>
              <span class="confidence">{{ insight.confidence }}%</span>
            </div>
            <p>{{ insight.description }}</p>
            <div class="insight-actions">
              <button class="btn btn-sm btn-primary" (click)="markAsRead(insight.id)">
                Marcar como Lida
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Entries -->
      <div class="recent-entries">
        <h3>Entradas Recentes</h3>
        <div class="entries-list" *ngIf="recentEntries.length > 0; else noEntries">
          <div *ngFor="let entry of recentEntries" class="entry-card">
            <div class="entry-header">
              <span class="entry-date">{{ entry.date | date:'dd/MM/yyyy' }}</span>
              <span 
                class="mood-badge" 
                [ngStyle]="{'background-color': getMoodColor(entry.mood)}"
              >
                {{ getMoodDisplayName(entry.mood) }}
              </span>
            </div>
            <div class="entry-content">
              <p *ngIf="entry.entryText">{{ entry.entryText | slice:0:200 }}{{ entry.entryText.length > 200 ? '...' : '' }}</p>
            </div>
            <div class="entry-metrics">
              <span *ngIf="entry.stressLevel" class="metric">
                <i class="fas fa-heartbeat"></i> Estresse: {{ entry.stressLevel }}/10
              </span>
              <span *ngIf="entry.sleepQuality" class="metric">
                <i class="fas fa-bed"></i> Sono: {{ entry.sleepQuality }}/5
              </span>
              <span *ngIf="entry.symptoms && entry.symptoms.length > 0" class="metric">
                <i class="fas fa-exclamation-triangle"></i> {{ entry.symptoms.length }} sintoma(s)
              </span>
            </div>
            <div class="entry-actions">
              <button class="btn btn-sm btn-outline" (click)="editEntry(entry)">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="btn btn-sm btn-danger" (click)="deleteEntry(entry.id)">
                <i class="fas fa-trash"></i> Excluir
              </button>
            </div>
          </div>
        </div>
        
        <ng-template #noEntries>
          <div class="no-entries">
            <i class="fas fa-book-open"></i>
            <p>Nenhuma entrada encontrada. Comece registrando seu primeiro dia!</p>
            <button class="btn btn-primary" (click)="openNewEntryModal()">
              Criar Primeira Entrada
            </button>
          </div>
        </ng-template>
      </div>
    </div>

    <!-- New Entry Modal -->
    <div class="modal" [ngClass]="{'show': showNewEntryModal}" *ngIf="showNewEntryModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Nova Entrada no Diário</h3>
          <button class="close-btn" (click)="closeNewEntryModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="saveNewEntry()" #entryForm="ngForm">
            <div class="form-group">
              <label for="date">Data:</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                [(ngModel)]="newEntry.date" 
                required
                class="form-control"
              >
            </div>
            
            <div class="form-group">
              <label for="mood">Humor:</label>
              <select 
                id="mood" 
                name="mood" 
                [(ngModel)]="newEntry.mood" 
                class="form-control"
              >
                <option value="">Selecione...</option>
                <option value="HAPPY">Feliz</option>
                <option value="CALM">Calmo</option>
                <option value="NEUTRAL">Neutro</option>
                <option value="WORRIED">Preocupado</option>
                <option value="STRESSED">Estressado</option>
                <option value="OVERWHELMED">Sobrecarregado</option>
                <option value="EXHAUSTED">Exausto</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="stressLevel">Nível de Estresse (1-10):</label>
                <input 
                  type="range" 
                  id="stressLevel" 
                  name="stressLevel" 
                  [(ngModel)]="newEntry.stressLevel" 
                  min="1" 
                  max="10" 
                  class="form-control"
                >
                <span class="range-value">{{ newEntry.stressLevel || 5 }}</span>
              </div>
              
              <div class="form-group">
                <label for="sleepQuality">Qualidade do Sono (1-5):</label>
                <input 
                  type="range" 
                  id="sleepQuality" 
                  name="sleepQuality" 
                  [(ngModel)]="newEntry.sleepQuality" 
                  min="1" 
                  max="5" 
                  class="form-control"
                >
                <span class="range-value">{{ newEntry.sleepQuality || 3 }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="entryText">Texto Livre:</label>
              <textarea 
                id="entryText" 
                name="entryText" 
                [(ngModel)]="newEntry.entryText" 
                rows="4" 
                placeholder="Como foi o dia? Quais foram os principais acontecimentos?"
                class="form-control"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  name="medicationAdherence" 
                  [(ngModel)]="newEntry.medicationAdherence"
                >
                Medicação tomada corretamente
              </label>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeNewEntryModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="!entryForm.valid">
                Salvar Entrada
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .diary-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .diary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .diary-header h1 {
      color: #2c3e50;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3498db;
      color: white;
      font-size: 20px;
    }

    .stat-icon.stress { background: #e74c3c; }
    .stat-icon.sleep { background: #9b59b6; }
    .stat-icon.medication { background: #27ae60; }

    .stat-content h3 {
      margin: 0;
      font-size: 24px;
      color: #2c3e50;
    }

    .stat-content p {
      margin: 5px 0 0 0;
      color: #7f8c8d;
      font-size: 14px;
    }

    .quick-actions {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .quick-actions h3 {
      margin-top: 0;
      color: #2c3e50;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .action-btn {
      background: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 15px 20px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: background 0.3s;
    }

    .action-btn:hover {
      background: #2980b9;
    }

    .insights-section {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }

    .insight-card {
      border-left: 4px solid #3498db;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 0 8px 8px 0;
    }

    .insight-card.pattern { border-left-color: #2196F3; }
    .insight-card.risk { border-left-color: #F44336; }
    .insight-card.suggestion { border-left-color: #4CAF50; }
    .insight-card.trend { border-left-color: #FF9800; }
    .insight-card.support { border-left-color: #9C27B0; }

    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .confidence {
      background: #3498db;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    .recent-entries {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .entries-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .entry-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      transition: box-shadow 0.3s;
    }

    .entry-card:hover {
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .entry-date {
      font-weight: bold;
      color: #2c3e50;
    }

    .mood-badge {
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .entry-metrics {
      display: flex;
      gap: 15px;
      margin: 10px 0;
      flex-wrap: wrap;
    }

    .metric {
      color: #7f8c8d;
      font-size: 14px;
    }

    .entry-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .no-entries {
      text-align: center;
      padding: 40px;
      color: #7f8c8d;
    }

    .no-entries i {
      font-size: 48px;
      margin-bottom: 20px;
      display: block;
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }

    .modal.show {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: white;
      border-radius: 10px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #7f8c8d;
    }

    .modal-body {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #2c3e50;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .range-value {
      margin-left: 10px;
      font-weight: bold;
      color: #3498db;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    /* Button Styles */
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .btn-outline {
      background: transparent;
      color: #3498db;
      border: 1px solid #3498db;
    }

    .btn-outline:hover {
      background: #3498db;
      color: white;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class DiaryMainComponent implements OnInit {
  recentEntries: DiaryEntry[] = [];
  stats: DiaryStats | null = null;
  unreadInsights: DiaryInsight[] = [];
  showNewEntryModal = false;
  newEntry: any = {
    date: new Date().toISOString().split('T')[0],
    mood: '',
    stressLevel: 5,
    sleepQuality: 3,
    entryText: '',
    medicationAdherence: true,
    notableEvents: [],
    symptoms: []
  };

  constructor(private diaryService: DiaryService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Mock patient caregiver ID - em produção viria do contexto do usuário
    const patientCaregiverId = 1;
    
    this.loadRecentEntries(patientCaregiverId);
    this.loadStats(patientCaregiverId);
    this.loadUnreadInsights(patientCaregiverId);
  }

  loadRecentEntries(patientCaregiverId: number) {
    this.diaryService.getDiaryEntries(patientCaregiverId).subscribe({
      next: (response) => {
        const data = this.diaryService.parseGraphQLResponse(response);
        this.recentEntries = data.diaryEntries || [];
      },
      error: (error) => {
        console.error('Error loading entries:', error);
      }
    });
  }

  loadStats(patientCaregiverId: number) {
    this.diaryService.getDiaryStats(patientCaregiverId, 30).subscribe({
      next: (response) => {
        const data = this.diaryService.parseGraphQLResponse(response);
        this.stats = JSON.parse(data.diaryStats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadUnreadInsights(patientCaregiverId: number) {
    this.diaryService.getUnreadInsights(patientCaregiverId).subscribe({
      next: (response) => {
        const data = this.diaryService.parseGraphQLResponse(response);
        this.unreadInsights = data.unreadInsights || [];
      },
      error: (error) => {
        console.error('Error loading insights:', error);
      }
    });
  }

  refreshData() {
    this.loadData();
  }

  openNewEntryModal() {
    this.showNewEntryModal = true;
  }

  closeNewEntryModal() {
    this.showNewEntryModal = false;
    this.resetNewEntry();
  }

  resetNewEntry() {
    this.newEntry = {
      date: new Date().toISOString().split('T')[0],
      mood: '',
      stressLevel: 5,
      sleepQuality: 3,
      entryText: '',
      medicationAdherence: true,
      notableEvents: [],
      symptoms: []
    };
  }

  saveNewEntry() {
    const entryData = {
      ...this.newEntry,
      patientCaregiverId: 1, // Mock ID
      date: new Date(this.newEntry.date)
    };

    this.diaryService.createDiaryEntry(entryData).subscribe({
      next: (response) => {
        this.closeNewEntryModal();
        this.loadData();
      },
      error: (error) => {
        console.error('Error saving entry:', error);
      }
    });
  }

  quickEntry(type: string) {
    // Implementar ações rápidas
    console.log('Quick entry:', type);
  }

  editEntry(entry: DiaryEntry) {
    // Implementar edição
    console.log('Edit entry:', entry);
  }

  deleteEntry(entryId: number) {
    if (confirm('Tem certeza que deseja excluir esta entrada?')) {
      this.diaryService.deleteDiaryEntry(entryId).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting entry:', error);
        }
      });
    }
  }

  markAsRead(insightId: number) {
    this.diaryService.markInsightAsRead(insightId).subscribe({
      next: () => {
        this.loadUnreadInsights(1); // Mock ID
      },
      error: (error) => {
        console.error('Error marking insight as read:', error);
      }
    });
  }

  getMoodDisplayName(mood: string): string {
    return this.diaryService.getMoodDisplayName(mood);
  }

  getMoodColor(mood: string): string {
    return this.diaryService.getMoodColor(mood);
  }

  getInsightTypeClass(type: string): string {
    const typeMap: Record<string, string> = {
      'PATTERN_DETECTED': 'pattern',
      'RISK_ALERT': 'risk',
      'SUGGESTION': 'suggestion',
      'TREND_ANALYSIS': 'trend',
      'EMOTIONAL_SUPPORT': 'support'
    };
    return typeMap[type] || '';
  }
}
