export interface AnnouncementResponse {
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low'
  mngDt: string;
  writeUserDocId: string;
  writeUserId: string;
  docId: string;
}