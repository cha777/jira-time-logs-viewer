import { JIRA_TASK_SUMMARY_TEXT_MAX_WIDTH } from './constants';

const ELLIPSIS = '...';

const normalizeString = (string: string) => {
  return string.replaceAll(/[\u0001-\u0006\u0008\u0009\u000B-\u001A]/g, '');
};

export const truncatedString = (string: string) => {
  const normalizedString = normalizeString(string);

  if (normalizedString.length > JIRA_TASK_SUMMARY_TEXT_MAX_WIDTH) {
    return normalizedString.substring(0, JIRA_TASK_SUMMARY_TEXT_MAX_WIDTH - ELLIPSIS.length) + ELLIPSIS;
  }

  return normalizedString;
};

export const timeFormatter = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.round(remainingSeconds / 60);
  let displayTime = `${hours}h`;

  if (minutes > 0) {
    displayTime += ` ${minutes}m`;
  }

  return displayTime;
};
