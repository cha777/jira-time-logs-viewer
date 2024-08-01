interface Issue {
  id: string;
  key: string;
  fields: { summary: string };
}

interface AdaptedIssue {
  issueId: string;
  issueKey: string;
  summary: string;
}
