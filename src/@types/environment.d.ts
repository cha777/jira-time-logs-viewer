declare module 'bun' {
  interface Env {
    JIRA_URL: string;
    JIRA_USER_NAME: string;
    JIRA_API_TOKEN: string;

    START_DATE: string;
    END_DATE: string?;

    USER_NAME: string?;
    USER_LIST: string?;

    VIEW_MODE: string;

    STOP_APP_UPDATE_CHECK: string;
    STOP_APP_ANALYTICS: string;
  }
}
