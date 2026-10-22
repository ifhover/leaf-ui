export type FeedbackType = 'success' | 'info' | 'warning' | 'danger';
export type FeedbackTypeInput = FeedbackType | 'error';

export function normalizeFeedbackType(type: FeedbackTypeInput): FeedbackType {
  return type === 'error' ? 'danger' : type;
}
