import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  DiaryEntry, 
  DiaryReminder, 
  DiaryInsight, 
  DiaryStats,
  CreateDiaryEntryDto,
  UpdateDiaryEntryDto 
} from '../models/diary-entry.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class DiaryService {
  private readonly apiUrl = `${environment.apiUrl}/graphql`;

  constructor(private http: HttpClient) {}

  // Diary Entries
  createDiaryEntry(input: CreateDiaryEntryDto): Observable<any> {
    const mutation = `
      mutation CreateDiaryEntry($input: CreateDiaryEntryDto!) {
        createDiaryEntry(input: $input) {
          id
          patientCaregiverId
          date
          entryText
          mood
          stressLevel
          sleepQuality
          medicationAdherence
          notableEvents
          symptoms
          createdAt
        }
      }
    `;

    return this.http.post(this.apiUrl, {
      query: mutation,
      variables: { input }
    });
  }

  updateDiaryEntry(id: number, input: UpdateDiaryEntryDto): Observable<any> {
    const mutation = `
      mutation UpdateDiaryEntry($id: Int!, $input: UpdateDiaryEntryDto!) {
        updateDiaryEntry(id: $id, input: $input) {
          id
          patientCaregiverId
          date
          entryText
          mood
          stressLevel
          sleepQuality
          medicationAdherence
          notableEvents
          symptoms
          updatedAt
        }
      }
    `;

    return this.http.post(this.apiUrl, {
      query: mutation,
      variables: { id, input }
    });
  }

  deleteDiaryEntry(id: number): Observable<any> {
    const mutation = `
      mutation DeleteDiaryEntry($id: Int!) {
        deleteDiaryEntry(id: $id)
      }
    `;

    return this.http.post(this.apiUrl, {
      query: mutation,
      variables: { id }
    });
  }

  getDiaryEntry(id: number): Observable<any> {
    const query = `
      query DiaryEntry($id: Int!) {
        diaryEntry(id: $id) {
          id
          patientCaregiverId
          date
          entryText
          mood
          stressLevel
          sleepQuality
          medicationAdherence
          notableEvents
          symptoms
          createdAt
          updatedAt
          observations {
            id
            type
            value
            timestamp
            notes
          }
        }
      }
    `;

    return this.http.post(this.apiUrl, {
      query,
      variables: { id }
    });
  }

  getDiaryEntries(
    patientCaregiverId: number,
    startDate?: Date,
    endDate?: Date
  ): Observable<any> {
    const query = `
      query DiaryEntries($patientCaregiverId: Int!, $startDate: DateTime, $endDate: DateTime) {
        diaryEntries(patientCaregiverId: $patientCaregiverId, startDate: $startDate, endDate: $endDate) {
          id
          patientCaregiverId
          date
          entryText
          mood
          stressLevel
          sleepQuality
          medicationAdherence
          notableEvents
          symptoms
          createdAt
          updatedAt
        }
      }
    `;

    return this.http.post(this.apiUrl, {
      query,
      variables: { patientCaregiverId, startDate, endDate }
    });
  }

  getDiaryStats(patientCaregiverId: number, days: number = 30): Observable<any> {
    const query = `
      query DiaryStats($patientCaregiverId: Int!, $days: Int!) {
        diaryStats(patientCaregiverId: $patientCaregiverId, days: $days)
      }
    `;

    return this.http.post(this.apiUrl, {
      query,
      variables: { patientCaregiverId, days }
    });
  }

  // Reminders
  getUpcomingReminders(patientCaregiverId: number): Observable<any> {
    const query = `
      query UpcomingReminders($patientCaregiverId: Int!) {
        upcomingReminders(patientCaregiverId: $patientCaregiverId) {
          id
          patientCaregiverId
          title
          description
          reminderType
          scheduledDate
          isCompleted
          isRecurring
          recurrencePattern
          createdAt
        }
      }
    `;

    return this.http.post(this.apiUrl, {
      query,
      variables: { patientCaregiverId }
    });
  }

  // Insights
  getUnreadInsights(patientCaregiverId: number): Observable<any> {
    const query = `
      query UnreadInsights($patientCaregiverId: Int!) {
        unreadInsights(patientCaregiverId: $patientCaregiverId) {
          id
          patientCaregiverId
          insightType
          title
          description
          confidence
          dataPoints
          isRead
          generatedAt
          createdAt
        }
      }
    `;

    return this.http.post(this.apiUrl, {
      query,
      variables: { patientCaregiverId }
    });
  }

  markInsightAsRead(insightId: number): Observable<any> {
    const mutation = `
      mutation MarkInsightAsRead($insightId: Int!) {
        markInsightAsRead(insightId: $insightId)
      }
    `;

    return this.http.post(this.apiUrl, {
      query: mutation,
      variables: { insightId }
    });
  }

  // Helper methods
  parseGraphQLResponse(response: any): any {
    if (response.data) {
      return response.data;
    }
    if (response.errors) {
      throw new Error(response.errors[0].message);
    }
    return response;
  }

  getMoodDisplayName(mood: string): string {
    const moodNames = {
      'HAPPY': 'Feliz',
      'CALM': 'Calmo',
      'NEUTRAL': 'Neutro',
      'WORRIED': 'Preocupado',
      'STRESSED': 'Estressado',
      'OVERWHELMED': 'Sobrecarregado',
      'EXHAUSTED': 'Exausto'
    };
    return moodNames[mood] || mood;
  }

  getMoodColor(mood: string): string {
    const moodColors = {
      'HAPPY': '#4CAF50',
      'CALM': '#2196F3',
      'NEUTRAL': '#9E9E9E',
      'WORRIED': '#FF9800',
      'STRESSED': '#F44336',
      'OVERWHELMED': '#E91E63',
      'EXHAUSTED': '#795548'
    };
    return moodColors[mood] || '#9E9E9E';
  }

  getInsightTypeDisplayName(type: string): string {
    const typeNames = {
      'PATTERN_DETECTED': 'Padrão Detectado',
      'RISK_ALERT': 'Alerta de Risco',
      'SUGGESTION': 'Sugestão',
      'TREND_ANALYSIS': 'Análise de Tendência',
      'EMOTIONAL_SUPPORT': 'Suporte Emocional'
    };
    return typeNames[type] || type;
  }

  getInsightTypeColor(type: string): string {
    const typeColors = {
      'PATTERN_DETECTED': '#2196F3',
      'RISK_ALERT': '#F44336',
      'SUGGESTION': '#4CAF50',
      'TREND_ANALYSIS': '#FF9800',
      'EMOTIONAL_SUPPORT': '#9C27B0'
    };
    return typeColors[type] || '#9E9E9E';
  }
}
