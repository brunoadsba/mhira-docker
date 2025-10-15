export interface DiaryEntry {
  id?: number;
  patientCaregiverId: number;
  date: Date;
  entryText?: string;
  mood?: MoodEnum;
  stressLevel?: number;
  sleepQuality?: number;
  medicationAdherence?: boolean;
  notableEvents?: string[];
  symptoms?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  patientCaregiver?: PatientCaregiver;
  observations?: DiaryObservation[];
}

export interface DiaryObservation {
  id?: number;
  diaryEntryId: number;
  type: ObservationTypeEnum;
  value?: string;
  timestamp?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  diaryEntry?: DiaryEntry;
}

export interface DiaryReminder {
  id?: number;
  patientCaregiverId: number;
  title: string;
  description?: string;
  reminderType: ReminderTypeEnum;
  scheduledDate?: Date;
  isCompleted: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt?: Date;
  updatedAt?: Date;
  patientCaregiver?: PatientCaregiver;
}

export interface DiaryInsight {
  id?: number;
  patientCaregiverId: number;
  insightType: InsightTypeEnum;
  title: string;
  description: string;
  confidence: number;
  dataPoints?: any;
  isRead: boolean;
  generatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  patientCaregiver?: PatientCaregiver;
}

export interface PatientCaregiver {
  id: number;
  patientId: number;
  caregiverId: number;
  relation?: string;
  note?: string;
  emergency?: boolean;
  createdAt: Date;
  updatedAt: Date;
  patient?: any;
  caregiver?: any;
  diaryEntries?: DiaryEntry[];
  diaryReminders?: DiaryReminder[];
  diaryInsights?: DiaryInsight[];
}

export interface CreateDiaryEntryDto {
  patientCaregiverId: number;
  date: Date;
  entryText?: string;
  mood?: MoodEnum;
  stressLevel?: number;
  sleepQuality?: number;
  medicationAdherence?: boolean;
  notableEvents?: string[];
  symptoms?: string[];
}

export interface UpdateDiaryEntryDto {
  entryText?: string;
  mood?: MoodEnum;
  stressLevel?: number;
  sleepQuality?: number;
  medicationAdherence?: boolean;
  notableEvents?: string[];
  symptoms?: string[];
}

export enum MoodEnum {
  HAPPY = 'HAPPY',
  CALM = 'CALM',
  NEUTRAL = 'NEUTRAL',
  WORRIED = 'WORRIED',
  STRESSED = 'STRESSED',
  OVERWHELMED = 'OVERWHELMED',
  EXHAUSTED = 'EXHAUSTED'
}

export enum ObservationTypeEnum {
  MEDICATION = 'MEDICATION',
  MEAL = 'MEAL',
  SLEEP = 'SLEEP',
  EXERCISE = 'EXERCISE',
  SOCIAL_ACTIVITY = 'SOCIAL_ACTIVITY',
  BEHAVIOR = 'BEHAVIOR',
  SYMPTOM = 'SYMPTOM',
  VITAL_SIGN = 'VITAL_SIGN'
}

export enum ReminderTypeEnum {
  MEDICATION = 'MEDICATION',
  APPOINTMENT = 'APPOINTMENT',
  EXERCISE = 'EXERCISE',
  MEAL = 'MEAL',
  PERSONAL_CARE = 'PERSONAL_CARE',
  CHECK_IN = 'CHECK_IN'
}

export enum InsightTypeEnum {
  PATTERN_DETECTED = 'PATTERN_DETECTED',
  RISK_ALERT = 'RISK_ALERT',
  SUGGESTION = 'SUGGESTION',
  TREND_ANALYSIS = 'TREND_ANALYSIS',
  EMOTIONAL_SUPPORT = 'EMOTIONAL_SUPPORT'
}

export interface DiaryStats {
  totalEntries: number;
  averageStressLevel: number;
  averageSleepQuality: number;
  medicationAdherenceRate: number;
  moodDistribution: Record<string, number>;
  commonSymptoms: Record<string, number>;
  recentTrends: any;
}