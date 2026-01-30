/** Inline template HTML content used by applyTemplate() */

export function getBlankContent(): string {
  return "<p></p>";
}

export function getMeetingNotesContent(): { title: string; content: string } {
  return {
    title: "Meeting Notes - " + new Date().toLocaleDateString(),
    content: `<h1>Meeting Notes</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Attendees:</strong> </p>
<hr>
<h2>Agenda</h2>
<ol><li>Topic 1</li><li>Topic 2</li><li>Topic 3</li></ol>
<h2>Discussion Points</h2>
<h3>Topic 1</h3>
<p>Notes about topic 1...</p>
<h3>Topic 2</h3>
<p>Notes about topic 2...</p>
<h2>Action Items</h2>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><p>Action item 1 - Assigned to: </p></li>
<li data-type="taskItem" data-checked="false"><p>Action item 2 - Assigned to: </p></li>
<li data-type="taskItem" data-checked="false"><p>Action item 3 - Assigned to: </p></li>
</ul>
<h2>Next Steps</h2>
<p>Summary of next steps and follow-up items...</p>
<hr>
<p><strong>Next Meeting:</strong> </p>`,
  };
}

export function getTodoContent(): { title: string; content: string } {
  return {
    title: "To-Do List",
    content: `<h2>Tasks</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"></li></ul>`,
  };
}

export function getTableContent(): string {
  return `<table>
<tr>
<th><p>Header 1</p></th>
<th><p>Header 2</p></th>
<th><p>Header 3</p></th>
</tr>
<tr>
<td><p></p></td>
<td><p></p></td>
<td><p></p></td>
</tr>
<tr>
<td><p></p></td>
<td><p></p></td>
<td><p></p></td>
</tr>
<tr>
<td><p></p></td>
<td><p></p></td>
<td><p></p></td>
</tr>
</table>
<p></p>`;
}

export function getProjectOverviewContent(): { title: string; content: string } {
  return {
    title: "Project Overview",
    content: `<h1>Project Overview</h1>
<h2>Summary</h2>
<p>Brief description of the project goals and objectives.</p>
<h2>Timeline</h2>
<table><tbody>
<tr><th><p>Phase</p></th><th><p>Start Date</p></th><th><p>End Date</p></th><th><p>Status</p></th></tr>
<tr><td><p>Planning</p></td><td><p>-</p></td><td><p>-</p></td><td><p>Not Started</p></td></tr>
<tr><td><p>Development</p></td><td><p>-</p></td><td><p>-</p></td><td><p>Not Started</p></td></tr>
<tr><td><p>Testing</p></td><td><p>-</p></td><td><p>-</p></td><td><p>Not Started</p></td></tr>
</tbody></table>
<h2>Key Deliverables</h2>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><p>Deliverable 1</p></li>
<li data-type="taskItem" data-checked="false"><p>Deliverable 2</p></li>
<li data-type="taskItem" data-checked="false"><p>Deliverable 3</p></li>
</ul>
<h2>Team Members</h2>
<table><tbody>
<tr><th><p>Name</p></th><th><p>Role</p></th><th><p>Responsibilities</p></th></tr>
<tr><td><p>-</p></td><td><p>Project Lead</p></td><td><p>Overall coordination</p></td></tr>
<tr><td><p>-</p></td><td><p>Developer</p></td><td><p>Implementation</p></td></tr>
</tbody></table>
<h2>Notes</h2>
<p>Additional notes and comments...</p>`,
  };
}
