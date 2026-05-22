export const instructorStats = [
  { label: 'Total Students', value: '128', note: 'from course_enrollments / section_enrollments' },
  { label: 'Avg Assessment Score', value: '84%', note: 'from assessment_attempts.score' },
  { label: 'Completed Missions', value: '76', note: 'from user_progress where completed = true' },
  { label: 'Active Challenges', value: '12', note: 'from challenges' },
];

export const leaderboardRows = [
  { rank: 1, name: 'Maria Santos', score: '98%', streak: '14 day streak' },
  { rank: 2, name: 'Juan Dela Cruz', score: '95%', streak: '12 day streak' },
  { rank: 3, name: 'Alyssa Cruz', score: '93%', streak: '11 day streak' },
  { rank: 4, name: 'Kian Reyes', score: '91%', streak: '10 day streak' },
  { rank: 5, name: 'Jessa Lim', score: '90%', streak: '9 day streak' },
];

export const atRiskStudents = [
  { name: 'Paolo Garcia', concern: 'Low quiz average', detail: 'assessment_attempts score below 60%' },
  { name: 'Nina Lopez', concern: 'Incomplete missions', detail: '4 unfinished missions in user_progress' },
  { name: 'Mark Uy', concern: 'Needs support', detail: 'No activity for 6 days' },
];

export const quickActions = [
  { label: 'Create material', tone: 'blue' },
  { label: 'Create assessment', tone: 'amber' },
  { label: 'Create challenge', tone: 'emerald' },
  { label: 'Post announcement', tone: 'slate' },
];

export const recentActivities = [
  { action: 'Juan completed Mission: Stacks', time: '5 min ago', type: 'Mission' },
  { action: 'Maria scored 85% on Pretest: Arrays', time: '21 min ago', type: 'Assessment' },
  { action: 'Coach posted a new section announcement', time: '43 min ago', type: 'Announcement' },
  { action: 'Alyssa attempted Challenge: Queue Sprint', time: '1 hr ago', type: 'Challenge' },
];

export const materials = [
  { title: 'Arrays and Pointers Primer', type: 'PDF', target: 'Topic: Arrays', uploadedAt: 'May 18, 2026' },
  { title: 'Linked List Walkthrough', type: 'Video', target: 'Mission: Linked Lists', uploadedAt: 'May 17, 2026' },
  { title: 'Big O Cheat Sheet', type: 'Tutorial', target: 'Topic: Complexity', uploadedAt: 'May 15, 2026' },
  { title: 'Stack Operations Demo', type: 'PDF', target: 'Mission: Stacks', uploadedAt: 'May 13, 2026' },
];

export const materialFilters = ['By Topic', 'By Mission', 'By Type'];

export const assessments = [
  { title: 'Pretest: Arrays', type: 'Quiz', points: 20, promptCount: 10 },
  { title: 'Midterm: Linked Lists', type: 'Exam', points: 50, promptCount: 25 },
  { title: 'Challenge Check: Queues', type: 'Drill', points: 15, promptCount: 8 },
];

export const missions = [
  { title: 'Stacks', progress: 86, order: 1 },
  { title: 'Queues', progress: 71, order: 2 },
  { title: 'Trees', progress: 54, order: 3 },
  { title: 'Graphs', progress: 32, order: 4 },
];

export const challenges = [
  { title: 'Queue Sprint', attempts: 38, avgScore: '78%' },
  { title: 'Tree Builder', attempts: 24, avgScore: '81%' },
  { title: 'Graph Racer', attempts: 19, avgScore: '74%' },
];

export const announcements = [
  { title: 'Section A quiz moved to Friday', scope: 'Section', postedAt: 'Today, 8:10 AM' },
  { title: 'New linked list materials available', scope: 'Course', postedAt: 'Yesterday, 4:25 PM' },
];

export const studentProgressRows = [
  {
    name: 'Juan Dela Cruz',
    mission: 'Stacks',
    missionProgress: '92%',
    latestAssessment: 'Pretest: Arrays - 88%',
    challenge: 'Queue Sprint - 84%',
  },
  {
    name: 'Maria Santos',
    mission: 'Queues',
    missionProgress: '74%',
    latestAssessment: 'Midterm: Linked Lists - 93%',
    challenge: 'Tree Builder - 90%',
  },
  {
    name: 'Alyssa Cruz',
    mission: 'Trees',
    missionProgress: '61%',
    latestAssessment: 'Pretest: Arrays - 79%',
    challenge: 'Graph Racer - 72%',
  },
];
