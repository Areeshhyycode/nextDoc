// Document Templates
// Each template defines title and HTML content for different document types

export interface DocumentTemplate {
  title: string;
  content: string;
  category: 'blank' | 'meeting_notes' | 'project_overview';
}

// Project Overview Template
export const projectOverviewTemplate: DocumentTemplate = {
  title: "Project Overview Doc",
  category: "project_overview",
  content: `
<h1 style="font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 8px;">Project Name: [Insert Project Name Here]</h1>
<p style="color: #6b7280; font-size: 14px; margin-bottom: 32px;">Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Purpose</h2>
<p style="color: #374151; line-height: 1.6;"><em>Write a short summary of the purpose of the project.</em></p>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Goals & Metrics</h2>
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background-color: #f9fafb;">
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Goal</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Success Metric 1</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Success Metric 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;"></td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;"></td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;"></td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;"></td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;"></td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;"></td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Scope</h2>

<h3 style="font-size: 15px; font-weight: 600; color: #059669; margin: 16px 0 8px 0;">In-Scope</h3>
<ul style="margin: 0 0 16px 0; padding-left: 24px; color: #374151; line-height: 1.8;">
  <li>[List of items included in the project]</li>
  <li>[Add more items as needed]</li>
</ul>

<h3 style="font-size: 15px; font-weight: 600; color: #dc2626; margin: 16px 0 8px 0;">Out-of-Scope</h3>
<ul style="margin: 0; padding-left: 24px; color: #374151; line-height: 1.8;">
  <li>[List of items excluded from the project]</li>
  <li>[Add more items as needed]</li>
</ul>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Deliverables</h2>
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background-color: #f9fafb;">
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Deliverable</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Description</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Due Date</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Owner</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Deliverable 1]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Brief description]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Date]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Name/Team]</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Deliverable 2]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Brief description]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Date]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Name/Team]</td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Milestones</h2>
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background-color: #f9fafb;">
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Milestone</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Description</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Target Date</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Milestone 1]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Brief description]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Date]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">Not Started</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Milestone 2]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Brief description]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Date]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">Not Started</td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Notes</h2>
<ul style="margin: 0; padding-left: 24px; color: #374151; line-height: 1.8;">
  <li>Add any additional notes or links here</li>
</ul>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Approvals</h2>
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background-color: #f9fafb;">
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Name</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Role</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Approval Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Name]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Role]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">Pending</td>
    </tr>
  </tbody>
</table>
`.trim()
};

// Meeting Notes Template
export const meetingNotesTemplate: DocumentTemplate = {
  title: "Meeting Notes",
  category: "meeting_notes",
  content: `
<h1 style="font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 24px;">Meeting Notes</h1>

<table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
  <tbody>
    <tr>
      <td style="padding: 8px 12px; color: #6b7280; width: 100px;">Date</td>
      <td style="padding: 8px 12px; color: #111827; font-weight: 500;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; color: #6b7280;">Time</td>
      <td style="padding: 8px 12px; color: #111827;">[Start Time] - [End Time]</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; color: #6b7280;">Location</td>
      <td style="padding: 8px 12px; color: #111827;">[Meeting Room / Video Call Link]</td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Attendees</h2>
<ul style="margin: 0 0 24px 0; padding-left: 24px; color: #374151; line-height: 1.8;">
  <li>[Name 1]</li>
  <li>[Name 2]</li>
  <li>[Name 3]</li>
</ul>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Agenda</h2>
<ol style="margin: 0 0 24px 0; padding-left: 24px; color: #374151; line-height: 1.8;">
  <li>[Agenda item 1]</li>
  <li>[Agenda item 2]</li>
  <li>[Agenda item 3]</li>
</ol>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Discussion</h2>
<h3 style="font-size: 15px; font-weight: 600; color: #374151; margin: 16px 0 8px 0;">[Topic 1]</h3>
<p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">[Notes about the discussion...]</p>

<h3 style="font-size: 15px; font-weight: 600; color: #374151; margin: 16px 0 8px 0;">[Topic 2]</h3>
<p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">[Notes about the discussion...]</p>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Action Items</h2>
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background-color: #f9fafb;">
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Action</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Owner</th>
      <th style="text-align: left; padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Due Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Action item 1]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Name]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Date]</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Action item 2]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Name]</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">[Date]</td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Decisions</h2>
<ul style="margin: 0 0 24px 0; padding-left: 24px; color: #374151; line-height: 1.8;">
  <li>[Decision 1]</li>
  <li>[Decision 2]</li>
</ul>

<h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Next Meeting</h2>
<p style="color: #374151; line-height: 1.6;"><strong>Date:</strong> [Next meeting date]</p>
<p style="color: #374151; line-height: 1.6;"><strong>Topics:</strong> [Brief preview of next meeting agenda]</p>
`.trim()
};

// Blank Template
export const blankTemplate: DocumentTemplate = {
  title: "Untitled Document",
  category: "blank",
  content: "<p></p>"
};

// Get template by category
export function getTemplate(category: 'blank' | 'meeting_notes' | 'project_overview'): DocumentTemplate {
  switch (category) {
    case 'project_overview':
      return projectOverviewTemplate;
    case 'meeting_notes':
      return {
        ...meetingNotesTemplate,
        title: `Meeting Notes - ${new Date().toLocaleDateString()}`
      };
    case 'blank':
    default:
      return blankTemplate;
  }
}

// Export all templates
export const templates = {
  blank: blankTemplate,
  meeting_notes: meetingNotesTemplate,
  project_overview: projectOverviewTemplate,
};
