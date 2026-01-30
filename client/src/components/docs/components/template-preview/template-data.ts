import type { TemplateData, TemplatePage } from "./types";

export const projectOverviewTemplate: TemplateData = {
  id: "project_overview",
  name: "Project Overview",
  pages: [
    {
      id: "project-brief",
      title: "Project Brief",
      content: {
        heading: "Project Brief",
        description: "A concise overview of your project's purpose and goals",
        callout: {
          title: "Project Brief Guidelines",
          items: [
            "Define the project purpose and business value",
            "Outline key objectives and success metrics",
            "Identify target audience and stakeholders",
          ],
        },
        sections: [
          { title: "Project Name", content: "Enter your project name..." },
          { title: "Project Summary", content: "Brief description of what this project aims to achieve..." },
          { title: "Business Objectives", content: "Key business goals this project supports..." },
        ],
      },
    },
    {
      id: "project-plan",
      title: "Project Plan",
      content: {
        heading: "Project Plan",
        description: "Detailed roadmap with phases, milestones, and deliverables",
        sections: [
          { title: "Phase 1: Discovery", content: "Research and requirements gathering..." },
          { title: "Phase 2: Design", content: "Solution design and architecture..." },
          { title: "Phase 3: Development", content: "Implementation and building..." },
          { title: "Phase 4: Testing", content: "QA and validation..." },
          { title: "Phase 5: Launch", content: "Deployment and go-live..." },
        ],
      },
    },
    {
      id: "requirements-doc",
      title: "Requirements Document",
      content: {
        heading: "Requirements Document",
        description: "Comprehensive list of functional and non-functional requirements",
        sections: [
          { title: "Functional Requirements", content: "What the system should do..." },
          { title: "Non-Functional Requirements", content: "Performance, security, scalability..." },
          { title: "User Stories", content: "As a user, I want to..." },
          { title: "Acceptance Criteria", content: "Conditions that must be met..." },
        ],
      },
    },
    {
      id: "stakeholder-map",
      title: "Stakeholder Map",
      content: {
        heading: "Stakeholder Map",
        description: "Identify and organize all project stakeholders",
        sections: [
          { title: "Project Sponsor", content: "Executive sponsor and decision maker..." },
          { title: "Core Team", content: "Team members and their roles..." },
          { title: "Subject Matter Experts", content: "Domain experts consulted..." },
          { title: "External Partners", content: "Vendors, contractors, agencies..." },
        ],
      },
    },
    {
      id: "risk-register",
      title: "Risk Register",
      content: {
        heading: "Risk Register",
        description: "Track and manage project risks and mitigation strategies",
        callout: {
          title: "Risk Management Tips",
          items: [
            "Identify risks early and review regularly",
            "Assign owners to each risk",
            "Create mitigation plans for high-priority risks",
          ],
        },
        sections: [
          { title: "High Priority Risks", content: "Critical risks requiring immediate attention..." },
          { title: "Medium Priority Risks", content: "Risks to monitor closely..." },
          { title: "Low Priority Risks", content: "Risks to track periodically..." },
        ],
      },
    },
  ],
};

export const meetingNotesTemplate: TemplateData = {
  id: "meeting_notes",
  name: "Meeting Notes",
  pages: [
    {
      id: "meeting-guidelines",
      title: "Meeting Guidelines",
      content: {
        heading: "Meeting Guidelines",
        description: "Best practices for effective meetings",
        callout: {
          title: "Meeting Expectations",
          items: [
            "Before the meeting, attendees add items and updates to the agenda.",
            "During the meeting, an assigned notetaker or all attendees capture notes in the Doc.",
            "After the meeting, the meeting facilitator assigns out action items by creating tasks.",
          ],
        },
      },
    },
    {
      id: "weekly-team-meeting",
      title: "Weekly Team Meeting",
      content: {
        heading: "Weekly Team Meeting",
        description: "Template for recurring team sync meetings",
        sections: [
          { title: "Date & Attendees", content: "Meeting date and participant list..." },
          { title: "Agenda", content: "Topics to discuss this week..." },
          { title: "Updates from Last Week", content: "Progress on previous action items..." },
          { title: "Discussion Notes", content: "Key points and decisions made..." },
          { title: "Action Items", content: "Tasks assigned with owners and deadlines..." },
        ],
      },
    },
    {
      id: "daily-standup",
      title: "Daily Standup/Sync",
      content: {
        heading: "Daily Standup/Sync",
        description: "Quick daily sync template for agile teams",
        callout: {
          title: "Standup Format",
          items: [
            "Keep it brief - 15 minutes max",
            "Each person shares updates",
            "Flag blockers immediately",
          ],
        },
        sections: [
          { title: "Yesterday", content: "What I accomplished yesterday..." },
          { title: "Today", content: "What I'm working on today..." },
          { title: "Blockers", content: "Any obstacles or blockers..." },
        ],
      },
    },
    {
      id: "one-on-one",
      title: "1:1 Meeting",
      content: {
        heading: "1:1 Meeting",
        description: "Template for manager-employee one-on-one meetings",
        sections: [
          { title: "Check-in", content: "How are you doing? Any personal updates?" },
          { title: "Wins & Achievements", content: "Recent accomplishments to celebrate..." },
          { title: "Challenges", content: "Current obstacles or concerns..." },
          { title: "Goals Progress", content: "Updates on OKRs or personal goals..." },
          { title: "Feedback", content: "Feedback for each other..." },
          { title: "Action Items", content: "Follow-up tasks..." },
        ],
      },
    },
    {
      id: "retrospective",
      title: "Retrospective",
      content: {
        heading: "Retrospective",
        description: "Sprint or project retrospective template",
        callout: {
          title: "Retro Guidelines",
          items: [
            "Focus on improvement, not blame",
            "Everyone's voice matters",
            "Commit to actionable changes",
          ],
        },
        sections: [
          { title: "What Went Well", content: "Successes and wins to celebrate..." },
          { title: "What Could Be Improved", content: "Areas for improvement..." },
          { title: "Action Items", content: "Specific changes to implement..." },
        ],
      },
    },
  ],
};

export function generateTemplateContent(page: TemplatePage): { title: string; content: string } {
  let html = "";

  html += `<h1>${page.content.heading}</h1>`;

  if (page.content.description) {
    html += `<p><em>${page.content.description}</em></p>`;
  }

  if (page.content.callout) {
    html += `<blockquote><p><strong>${page.content.callout.title}</strong></p><ul>`;
    page.content.callout.items.forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += `</ul></blockquote>`;
  }

  if (page.content.sections) {
    page.content.sections.forEach(section => {
      html += `<h2>${section.title}</h2>`;
      if (section.content) {
        html += `<p>${section.content}</p>`;
      } else {
        html += `<p></p>`;
      }
    });
  }

  return {
    title: page.content.heading,
    content: html,
  };
}
