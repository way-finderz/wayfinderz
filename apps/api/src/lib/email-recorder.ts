export interface RecordedEmail {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  subject: string;
  templateName?: string;
  templateProps?: Record<string, unknown>;
}

let recordedEmails: RecordedEmail[] = [];
let recordingEnabled = false;

export function enableEmailRecording(): void {
  recordingEnabled = true;
  recordedEmails = [];
}

export function disableEmailRecording(): void {
  recordingEnabled = false;
  recordedEmails = [];
}

export function isEmailRecordingEnabled(): boolean {
  return recordingEnabled;
}

export function recordEmail(
  email: Omit<RecordedEmail, "id" | "timestamp">
): RecordedEmail {
  const recorded: RecordedEmail = {
    ...email,
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  };
  recordedEmails.push(recorded);

  return recorded;
}

export function getRecordedEmails(): RecordedEmail[] {
  return [...recordedEmails];
}

export function clearRecordedEmails(): void {
  recordedEmails = [];
}

export function findEmailsByRecipient(to: string): RecordedEmail[] {
  return recordedEmails.filter((e) => e.to === to);
}

export function findEmailsBySubject(subject: string): RecordedEmail[] {
  const lowerSubject = subject.toLowerCase();

  return recordedEmails.filter((e) =>
    e.subject.toLowerCase().includes(lowerSubject)
  );
}
