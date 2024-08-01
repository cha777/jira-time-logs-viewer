import assert from 'node:assert';
import { ViewMode } from './constants';

assert(Bun.env.JIRA_URL, 'JIRA_URL not set');
assert(Bun.env.JIRA_USER_NAME, 'JIRA_USER_NAME not set');
assert(Bun.env.JIRA_API_TOKEN, 'JIRA_API_TOKEN not set');

const viewModeValue = Number(Bun.env.VIEW_MODE) || ViewMode.Individual.valueOf();
const viewMode: ViewMode =
  viewModeValue === ViewMode.Individual || viewModeValue === ViewMode.Team ? viewModeValue : ViewMode.Individual;

let users: string[];

if (viewMode === ViewMode.Individual) {
  users = [Bun.env.USER_NAME || Bun.env.JIRA_USER_NAME];
} else {
  const usersList = Bun.env.USER_LIST;
  assert(usersList, 'USER_LIST not set');

  users = usersList.split(',').sort();
}

export const configurations = {
  viewMode,
  users,
};
