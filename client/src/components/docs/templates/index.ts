// Document Templates
// Each template defines title and HTML content for different document types

export interface DocumentTemplate {
  title: string;
  content: string;
  category: 'blank' | 'meeting_notes' | 'project_overview' | 'todo_list';
}

// Project Overview Template
export const projectOverviewTemplate: DocumentTemplate = {
  title: "Project Overview Doc",
  category: "project_overview",
  content: `
<div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3b7cb8 100%); padding: 40px; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 10px 40px rgba(30, 58, 95, 0.3);">
  <p style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">Project Overview</p>
  <h1 style="font-size: 36px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; letter-spacing: -0.5px; line-height: 1.2;">[Project Name]</h1>
  <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: center;">
    <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    <span style="background: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">Draft</span>
  </div>
</div>

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px;">
  <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #16a34a;">
    <p style="font-size: 11px; font-weight: 700; color: #15803d; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Status</p>
    <p style="font-size: 20px; font-weight: 800; color: #166534; margin: 0;">Planning</p>
  </div>
  <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #2563eb;">
    <p style="font-size: 11px; font-weight: 700; color: #1d4ed8; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Project Lead</p>
    <p style="font-size: 20px; font-weight: 800; color: #1e40af; margin: 0;">[Name]</p>
  </div>
  <div style="background: linear-gradient(135deg, #fefce8 0%, #fef08a 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #ca8a04;">
    <p style="font-size: 11px; font-weight: 700; color: #a16207; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Start Date</p>
    <p style="font-size: 20px; font-weight: 800; color: #854d0e; margin: 0;">[Date]</p>
  </div>
  <div style="background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #7c3aed;">
    <p style="font-size: 11px; font-weight: 700; color: #6d28d9; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Target Date</p>
    <p style="font-size: 20px; font-weight: 800; color: #5b21b6; margin: 0;">[Date]</p>
  </div>
</div>

<div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 28px; margin-bottom: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <h2 style="font-size: 13px; font-weight: 700; color: #6b7280; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1.5px;">Executive Summary</h2>
  <p style="color: #374151; line-height: 1.8; margin: 0; font-size: 15px;">Provide a brief overview of the project, its strategic importance, and expected business outcomes. This summary should enable stakeholders to quickly understand the project's value proposition in 2-3 sentences.</p>
</div>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #2563eb;">Goals & Success Metrics</h2>
<table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <thead>
    <tr>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Goal</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Key Result</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Target</th>
      <th style="text-align: center; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 100px;">Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Goal 1]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Measurable outcome]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Target value]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #dc2626, #ef4444); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">High</span></td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Goal 2]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Measurable outcome]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Target value]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Medium</span></td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; color: #111827; font-weight: 600;">[Goal 3]</td>
      <td style="padding: 16px 20px; color: #4b5563;">[Measurable outcome]</td>
      <td style="padding: 16px 20px; color: #4b5563;">[Target value]</td>
      <td style="padding: 16px 20px; text-align: center;"><span style="background: linear-gradient(135deg, #16a34a, #22c55e); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Low</span></td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #16a34a;">Project Scope</h2>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
  <div style="background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%); border-radius: 16px; padding: 24px; border: 2px solid #bbf7d0; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);">
    <h3 style="font-size: 14px; font-weight: 800; color: #166534; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">In Scope</h3>
    <ul style="margin: 0; padding-left: 20px; color: #15803d; line-height: 2.2; font-size: 14px;">
      <li>[Feature or deliverable included]</li>
      <li>[Feature or deliverable included]</li>
      <li>[Feature or deliverable included]</li>
      <li>[Feature or deliverable included]</li>
    </ul>
  </div>
  <div style="background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); border-radius: 16px; padding: 24px; border: 2px solid #fecaca; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);">
    <h3 style="font-size: 14px; font-weight: 800; color: #991b1b; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Out of Scope</h3>
    <ul style="margin: 0; padding-left: 20px; color: #b91c1c; line-height: 2.2; font-size: 14px;">
      <li>[Explicitly excluded item]</li>
      <li>[Explicitly excluded item]</li>
      <li>[Explicitly excluded item]</li>
      <li>[Explicitly excluded item]</li>
    </ul>
  </div>
</div>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #7c3aed;">Key Deliverables</h2>
<table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <thead>
    <tr>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Deliverable</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Description</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Owner</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Due Date</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Deliverable 1]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Brief description]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Name/Team]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Date]</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Deliverable 2]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Brief description]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Name/Team]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Date]</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; color: #111827; font-weight: 600;">[Deliverable 3]</td>
      <td style="padding: 16px 20px; color: #4b5563;">[Brief description]</td>
      <td style="padding: 16px 20px; color: #4b5563;">[Name/Team]</td>
      <td style="padding: 16px 20px; color: #111827; font-weight: 500;">[Date]</td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #0891b2;">Timeline & Milestones</h2>
<table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <thead>
    <tr>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Milestone</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Description</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Target Date</th>
      <th style="text-align: center; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 130px;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Milestone 1]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Description]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Date]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: #e5e7eb; color: #4b5563; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Not Started</span></td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Milestone 2]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Description]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Date]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">In Progress</span></td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; color: #111827; font-weight: 600;">[Milestone 3]</td>
      <td style="padding: 16px 20px; color: #4b5563;">[Description]</td>
      <td style="padding: 16px 20px; color: #111827; font-weight: 500;">[Date]</td>
      <td style="padding: 16px 20px; text-align: center;"><span style="background: linear-gradient(135deg, #16a34a, #22c55e); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Complete</span></td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #059669;">Team & Stakeholders</h2>
<table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <thead>
    <tr>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Name</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Role</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Responsibilities</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Contact</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Name]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6;"><span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Project Lead</span></td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">Overall project ownership</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Email]</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Name]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6;"><span style="background: #faf5ff; color: #6d28d9; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Stakeholder</span></td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">Review and approval</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Email]</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; color: #111827; font-weight: 600;">[Name]</td>
      <td style="padding: 16px 20px;"><span style="background: #f0fdf4; color: #166534; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Team Member</span></td>
      <td style="padding: 16px 20px; color: #4b5563;">[Specific responsibilities]</td>
      <td style="padding: 16px 20px; color: #4b5563;">[Email]</td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #dc2626;">Risks & Mitigation</h2>
<table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <thead>
    <tr>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Risk</th>
      <th style="text-align: center; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 100px;">Impact</th>
      <th style="text-align: center; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 100px;">Likelihood</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Mitigation Strategy</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827;">[Risk description]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #dc2626, #ef4444); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">High</span></td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Medium</span></td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Mitigation approach]</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 16px 20px; color: #111827;">[Risk description]</td>
      <td style="padding: 16px 20px; text-align: center;"><span style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Medium</span></td>
      <td style="padding: 16px 20px; text-align: center;"><span style="background: linear-gradient(135deg, #16a34a, #22c55e); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Low</span></td>
      <td style="padding: 16px 20px; color: #4b5563;">[Mitigation approach]</td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #f59e0b;">Resources & Budget</h2>
<div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 16px; padding: 24px; border: 1px solid #fcd34d; margin-bottom: 32px;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
    <div>
      <p style="font-size: 11px; font-weight: 700; color: #92400e; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Estimated Budget</p>
      <p style="font-size: 28px; font-weight: 800; color: #78350f; margin: 0;">[Amount]</p>
    </div>
    <div>
      <p style="font-size: 11px; font-weight: 700; color: #92400e; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Resource Requirements</p>
      <p style="font-size: 15px; color: #92400e; margin: 0; line-height: 1.6;">[List key resources needed]</p>
    </div>
  </div>
</div>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #6366f1;">Approvals</h2>
<table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <thead>
    <tr>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Approver</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Role</th>
      <th style="text-align: center; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 130px;">Status</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Name]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">[Role]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Pending</span></td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #9ca3af;">—</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 16px 20px; color: #111827; font-weight: 600;">[Name]</td>
      <td style="padding: 16px 20px; color: #4b5563;">[Role]</td>
      <td style="padding: 16px 20px; text-align: center;"><span style="background: linear-gradient(135deg, #16a34a, #22c55e); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Approved</span></td>
      <td style="padding: 16px 20px; color: #111827;">[Date]</td>
    </tr>
  </tbody>
</table>

<div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 40px; border: 1px solid #e2e8f0;">
  <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">Document Version 1.0 | Confidential | For Internal Use Only</p>
</div>
`.trim()
};

// Meeting Notes Template
export const meetingNotesTemplate: DocumentTemplate = {
  title: "Meeting Notes",
  category: "meeting_notes",
  content: `
<div style="background: linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #14b8a6 100%); padding: 40px; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 10px 40px rgba(13, 148, 136, 0.3);">
  <p style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">Meeting Notes</p>
  <h1 style="font-size: 36px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; letter-spacing: -0.5px; line-height: 1.2;">[Meeting Title]</h1>
  <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
</div>

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px;">
  <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #14b8a6;">
    <p style="font-size: 11px; font-weight: 700; color: #0d9488; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Time</p>
    <p style="font-size: 18px; font-weight: 800; color: #134e4a; margin: 0;">[Start] - [End]</p>
  </div>
  <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #2563eb;">
    <p style="font-size: 11px; font-weight: 700; color: #1d4ed8; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Location</p>
    <p style="font-size: 18px; font-weight: 800; color: #1e40af; margin: 0;">[Room/Link]</p>
  </div>
  <div style="background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #7c3aed;">
    <p style="font-size: 11px; font-weight: 700; color: #6d28d9; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Organizer</p>
    <p style="font-size: 18px; font-weight: 800; color: #5b21b6; margin: 0;">[Name]</p>
  </div>
  <div style="background: linear-gradient(135deg, #fefce8 0%, #fef08a 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #ca8a04;">
    <p style="font-size: 11px; font-weight: 700; color: #a16207; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Duration</p>
    <p style="font-size: 18px; font-weight: 800; color: #854d0e; margin: 0;">[Duration]</p>
  </div>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
  <div style="background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h2 style="font-size: 13px; font-weight: 700; color: #6b7280; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 1.5px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">Attendees</h2>
    <ul style="margin: 0; padding: 0; list-style: none;">
      <li style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Name 1] <span style="color: #6b7280; font-weight: 400;">- [Role]</span></li>
      <li style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Name 2] <span style="color: #6b7280; font-weight: 400;">- [Role]</span></li>
      <li style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Name 3] <span style="color: #6b7280; font-weight: 400;">- [Role]</span></li>
      <li style="padding: 10px 0; color: #111827; font-weight: 500;">[Name 4] <span style="color: #6b7280; font-weight: 400;">- [Role]</span></li>
    </ul>
  </div>
  <div style="background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h2 style="font-size: 13px; font-weight: 700; color: #6b7280; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 1.5px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">Agenda</h2>
    <ol style="margin: 0; padding-left: 20px; color: #374151; line-height: 2.2; font-size: 14px;">
      <li style="padding: 4px 0;">[Agenda item 1]</li>
      <li style="padding: 4px 0;">[Agenda item 2]</li>
      <li style="padding: 4px 0;">[Agenda item 3]</li>
      <li style="padding: 4px 0;">[Agenda item 4]</li>
    </ol>
  </div>
</div>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #0d9488;">Discussion Notes</h2>

<div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
    <span style="background: linear-gradient(135deg, #0d9488, #14b8a6); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Topic 1</span>
  </div>
  <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">[Topic Title]</h3>
  <p style="color: #4b5563; line-height: 1.8; margin: 0; font-size: 14px;">Key points discussed and outcomes. Include relevant details, decisions made, and any follow-up items identified during the discussion...</p>
</div>

<div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
    <span style="background: linear-gradient(135deg, #0d9488, #14b8a6); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Topic 2</span>
  </div>
  <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">[Topic Title]</h3>
  <p style="color: #4b5563; line-height: 1.8; margin: 0; font-size: 14px;">Key points discussed and outcomes. Include relevant details, decisions made, and any follow-up items identified during the discussion...</p>
</div>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #dc2626;">Action Items</h2>
<table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <thead>
    <tr>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Action Item</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Owner</th>
      <th style="text-align: left; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Due Date</th>
      <th style="text-align: center; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 120px;">Priority</th>
      <th style="text-align: center; padding: 16px 20px; background: #1e3a5f; font-weight: 700; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 120px;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827;">[Action item description]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Name]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Date]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #dc2626, #ef4444); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">High</span></td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Pending</span></td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827;">[Action item description]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">[Name]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">[Date]</td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Medium</span></td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; text-align: center;"><span style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">In Progress</span></td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 16px 20px; color: #111827;">[Action item description]</td>
      <td style="padding: 16px 20px; color: #111827; font-weight: 600;">[Name]</td>
      <td style="padding: 16px 20px; color: #111827; font-weight: 500;">[Date]</td>
      <td style="padding: 16px 20px; text-align: center;"><span style="background: linear-gradient(135deg, #16a34a, #22c55e); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Low</span></td>
      <td style="padding: 16px 20px; text-align: center;"><span style="background: linear-gradient(135deg, #16a34a, #22c55e); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">Done</span></td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #16a34a;">Key Decisions</h2>
<div style="background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%); border-radius: 16px; padding: 24px; border: 2px solid #bbf7d0; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);">
  <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #dcfce7;">
    <p style="font-size: 11px; font-weight: 700; color: #15803d; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Decision 1</p>
    <p style="font-size: 15px; color: #166534; margin: 0; line-height: 1.6; font-weight: 500;">[Description of the decision made and its rationale]</p>
  </div>
  <div>
    <p style="font-size: 11px; font-weight: 700; color: #15803d; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Decision 2</p>
    <p style="font-size: 15px; color: #166534; margin: 0; line-height: 1.6; font-weight: 500;">[Description of the decision made and its rationale]</p>
  </div>
</div>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #7c3aed;">Next Meeting</h2>
<div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 16px; padding: 24px; border: 1px solid #e9d5ff;">
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px;">
    <div>
      <p style="font-size: 11px; font-weight: 700; color: #7c3aed; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Date</p>
      <p style="font-size: 18px; font-weight: 700; color: #5b21b6; margin: 0;">[Date]</p>
    </div>
    <div>
      <p style="font-size: 11px; font-weight: 700; color: #7c3aed; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Time</p>
      <p style="font-size: 18px; font-weight: 700; color: #5b21b6; margin: 0;">[Time]</p>
    </div>
    <div>
      <p style="font-size: 11px; font-weight: 700; color: #7c3aed; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Location</p>
      <p style="font-size: 18px; font-weight: 700; color: #5b21b6; margin: 0;">[Room/Link]</p>
    </div>
  </div>
  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9d5ff;">
    <p style="font-size: 11px; font-weight: 700; color: #7c3aed; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Tentative Agenda</p>
    <p style="font-size: 14px; color: #6b21a8; margin: 0; line-height: 1.6;">[Brief preview of topics to cover in the next meeting]</p>
  </div>
</div>

<h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #64748b;">Parking Lot</h2>
<div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
  <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0; font-style: italic;">Items to be discussed in future meetings or requiring further research:</p>
  <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 2; font-size: 14px;">
    <li>[Parking lot item 1]</li>
    <li>[Parking lot item 2]</li>
  </ul>
</div>

<div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 40px; border: 1px solid #e2e8f0;">
  <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">Meeting notes recorded by [Name] | Distributed to all attendees</p>
</div>
`.trim()
};

// To-Do List Template
export const todoListTemplate: DocumentTemplate = {
  title: "To-Do List",
  category: "todo_list",
  content: `
<div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); padding: 40px; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 10px 40px rgba(5, 150, 105, 0.3);">
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
    <div style="background: rgba(255,255,255,0.2); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 24px;">✓</span>
    </div>
    <div>
      <p style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.7); margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 2px;">Task Manager</p>
      <h1 style="font-size: 32px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">My To-Do List</h1>
    </div>
  </div>
  <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
</div>

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px;">
  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #f59e0b; text-align: center;">
    <p style="font-size: 28px; font-weight: 800; color: #b45309; margin: 0;">0</p>
    <p style="font-size: 11px; font-weight: 700; color: #92400e; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Total Tasks</p>
  </div>
  <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #3b82f6; text-align: center;">
    <p style="font-size: 28px; font-weight: 800; color: #1d4ed8; margin: 0;">0</p>
    <p style="font-size: 11px; font-weight: 700; color: #1e40af; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">In Progress</p>
  </div>
  <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #10b981; text-align: center;">
    <p style="font-size: 28px; font-weight: 800; color: #059669; margin: 0;">0</p>
    <p style="font-size: 11px; font-weight: 700; color: #047857; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Completed</p>
  </div>
  <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #ec4899; text-align: center;">
    <p style="font-size: 28px; font-weight: 800; color: #be185d; margin: 0;">0</p>
    <p style="font-size: 11px; font-weight: 700; color: #9d174d; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Overdue</p>
  </div>
</div>

<h2 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #ef4444; display: flex; align-items: center; gap: 10px;">
  <span style="background: #fef2f2; color: #dc2626; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">HIGH</span>
  Priority Tasks
</h2>
<div style="background: #ffffff; border: 1px solid #fecaca; border-radius: 12px; overflow: hidden; margin-bottom: 32px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);">
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #fee2e2; background: #fffbfb;">
    <div style="width: 22px; height: 22px; border: 2px solid #f87171; border-radius: 6px; flex-shrink: 0;"></div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">[High priority task]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Due: [Date]</p>
    </div>
    <span style="background: linear-gradient(135deg, #dc2626, #ef4444); color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;">Urgent</span>
  </div>
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #ffffff;">
    <div style="width: 22px; height: 22px; border: 2px solid #f87171; border-radius: 6px; flex-shrink: 0;"></div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">[High priority task]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Due: [Date]</p>
    </div>
    <span style="background: linear-gradient(135deg, #dc2626, #ef4444); color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;">Urgent</span>
  </div>
</div>

<h2 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #3b82f6; display: flex; align-items: center; gap: 10px;">
  <span style="background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">TODAY</span>
  Today's Tasks
</h2>
<div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f3f4f6;">
    <div style="width: 22px; height: 22px; border: 2px solid #d1d5db; border-radius: 6px; flex-shrink: 0;"></div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">[Task description]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Category: Work</p>
    </div>
    <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700;">9:00 AM</span>
  </div>
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; background: #f9fafb;">
    <div style="width: 22px; height: 22px; border: 2px solid #d1d5db; border-radius: 6px; flex-shrink: 0;"></div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">[Task description]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Category: Personal</p>
    </div>
    <span style="background: #fce7f3; color: #be185d; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700;">2:00 PM</span>
  </div>
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px;">
    <div style="width: 22px; height: 22px; border: 2px solid #d1d5db; border-radius: 6px; flex-shrink: 0;"></div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">[Task description]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Category: Health</p>
    </div>
    <span style="background: #d1fae5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700;">5:00 PM</span>
  </div>
</div>

<h2 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #8b5cf6; display: flex; align-items: center; gap: 10px;">
  <span style="background: #f3e8ff; color: #7c3aed; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">UPCOMING</span>
  This Week
</h2>
<div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f3f4f6;">
    <div style="width: 22px; height: 22px; border: 2px solid #d1d5db; border-radius: 6px; flex-shrink: 0;"></div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">[Task description]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Due: Tomorrow</p>
    </div>
    <span style="background: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700;">Medium</span>
  </div>
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #f9fafb;">
    <div style="width: 22px; height: 22px; border: 2px solid #d1d5db; border-radius: 6px; flex-shrink: 0;"></div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">[Task description]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Due: Wednesday</p>
    </div>
    <span style="background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700;">Low</span>
  </div>
</div>

<h2 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #10b981; display: flex; align-items: center; gap: 10px;">
  <span style="background: #d1fae5; color: #059669; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">DONE</span>
  Completed Tasks
</h2>
<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f3f4f6;">
    <div style="width: 22px; height: 22px; background: linear-gradient(135deg, #10b981, #34d399); border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
      <span style="color: white; font-size: 12px; font-weight: bold;">✓</span>
    </div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 500; color: #9ca3af; text-decoration: line-through;">[Completed task]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1d5db;">Completed today</p>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px;">
    <div style="width: 22px; height: 22px; background: linear-gradient(135deg, #10b981, #34d399); border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
      <span style="color: white; font-size: 12px; font-weight: bold;">✓</span>
    </div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 500; color: #9ca3af; text-decoration: line-through;">[Completed task]</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1d5db;">Completed yesterday</p>
    </div>
  </div>
</div>

<div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 24px; border: 2px solid #bbf7d0; margin-bottom: 24px;">
  <h3 style="font-size: 14px; font-weight: 800; color: #166534; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Quick Notes</h3>
  <p style="color: #15803d; line-height: 1.8; margin: 0; font-size: 14px;">Add any quick notes, reminders, or ideas here...</p>
</div>

<div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 40px; border: 1px solid #e2e8f0;">
  <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">Stay organized and productive! Update your tasks regularly.</p>
</div>
`.trim()
};

// Blank Template
export const blankTemplate: DocumentTemplate = {
  title: "Untitled Document",
  category: "blank",
  content: "<p></p>"
};

// Get template by category
export function getTemplate(category: 'blank' | 'meeting_notes' | 'project_overview' | 'todo_list'): DocumentTemplate {
  switch (category) {
    case 'project_overview':
      return projectOverviewTemplate;
    case 'meeting_notes':
      return {
        ...meetingNotesTemplate,
        title: `Meeting Notes - ${new Date().toLocaleDateString()}`
      };
    case 'todo_list':
      return {
        ...todoListTemplate,
        title: `To-Do List - ${new Date().toLocaleDateString()}`
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
  todo_list: todoListTemplate,
};
