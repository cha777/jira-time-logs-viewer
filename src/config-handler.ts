import assert from 'node:assert';
import { ViewMode } from './constants';

assert(process.env.JIRA_URL, 'JIRA_URL not set');
assert(process.env.JIRA_USER_NAME, 'JIRA_USER_NAME not set');
assert(process.env.JIRA_API_TOKEN, 'JIRA_API_TOKEN not set');

const viewModeValue = Number(process.env.VIEW_MODE) || ViewMode.Individual.valueOf();
const viewMode: ViewMode =
  viewModeValue === ViewMode.Individual || viewModeValue === ViewMode.Team ? viewModeValue : ViewMode.Individual;

let users: string[];

if (viewMode === ViewMode.Individual) {
  users = [process.env.USER_NAME || process.env.JIRA_USER_NAME];
} else {
  const usersList = process.env.USER_LIST;
  assert(usersList, 'USER_LIST not set');

  users = usersList.split(',').sort();
}

export const configurations = {
  viewMode,
  users,
};
