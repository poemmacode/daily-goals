export interface GoalTemplate {
  id: string;
  title: string;
  category: string;
  allocated_minutes: number;
  active_days: number[];
  color: string;
  notes: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // Career
  {
    id: "career-apply",
    title: "Apply to jobs",
    category: "career",
    allocated_minutes: 30,
    active_days: [1, 2, 3, 4, 5],
    color: "#6366f1",
    notes: "Search and apply to relevant positions.",
  },
  {
    id: "career-network",
    title: "Network with professionals",
    category: "career",
    allocated_minutes: 20,
    active_days: [1, 3, 5],
    color: "#6366f1",
    notes: "Connect with 2-3 people on LinkedIn or attend events.",
  },
  // Learning
  {
    id: "learn-language",
    title: "Practice English",
    category: "learning",
    allocated_minutes: 30,
    active_days: [0, 1, 2, 3, 4, 5, 6],
    color: "#22c55e",
    notes: "Use apps, read, or practice speaking.",
  },
  {
    id: "learn-code",
    title: "Code practice",
    category: "learning",
    allocated_minutes: 45,
    active_days: [1, 2, 3, 4, 5],
    color: "#22c55e",
    notes: "Work on coding challenges or personal projects.",
  },
  {
    id: "learn-read",
    title: "Read",
    category: "learning",
    allocated_minutes: 30,
    active_days: [0, 1, 2, 3, 4, 5, 6],
    color: "#22c55e",
    notes: "Read books, articles, or documentation.",
  },
  // Fitness
  {
    id: "fitness-exercise",
    title: "Exercise",
    category: "fitness",
    allocated_minutes: 45,
    active_days: [1, 3, 5],
    color: "#f59e0b",
    notes: "Gym, run, home workout, or any physical activity.",
  },
  {
    id: "fitness-walk",
    title: "Walk 30 minutes",
    category: "fitness",
    allocated_minutes: 30,
    active_days: [0, 1, 2, 3, 4, 5, 6],
    color: "#f59e0b",
    notes: "Take a walk outdoors.",
  },
  {
    id: "fitness-meditate",
    title: "Meditate",
    category: "fitness",
    allocated_minutes: 10,
    active_days: [0, 1, 2, 3, 4, 5, 6],
    color: "#f59e0b",
    notes: "Mindfulness or breathing exercises.",
  },
  // Personal
  {
    id: "personal-journal",
    title: "Journal",
    category: "personal",
    allocated_minutes: 15,
    active_days: [0, 1, 2, 3, 4, 5, 6],
    color: "#a855f7",
    notes: "Write about your day, thoughts, or goals.",
  },
  {
    id: "personal-hygiene",
    title: "Morning routine",
    category: "personal",
    allocated_minutes: 30,
    active_days: [0, 1, 2, 3, 4, 5, 6],
    color: "#a855f7",
    notes: "Consistent morning habits for a productive day.",
  },
  // Finance
  {
    id: "finance-track",
    title: "Track expenses",
    category: "finance",
    allocated_minutes: 10,
    active_days: [0, 1, 2, 3, 4, 5, 6],
    color: "#06b6d4",
    notes: "Log today's spending.",
  },
  {
    id: "finance-budget",
    title: "Review budget",
    category: "finance",
    allocated_minutes: 20,
    active_days: [0],
    color: "#06b6d4",
    notes: "Weekly budget review and planning.",
  },
  // Projects
  {
    id: "project-side",
    title: "Work on side project",
    category: "projects",
    allocated_minutes: 60,
    active_days: [1, 3, 5],
    color: "#ec4899",
    notes: "Dedicated time for your personal project.",
  },
  {
    id: "project-learn",
    title: "Learn something new",
    category: "projects",
    allocated_minutes: 30,
    active_days: [2, 4],
    color: "#ec4899",
    notes: "Online course, tutorial, or new skill.",
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "career", label: { en: "Career", es: "Carrera" }, icon: "💼" },
  { id: "learning", label: { en: "Learning", es: "Aprendizaje" }, icon: "📚" },
  { id: "fitness", label: { en: "Fitness", es: "Fitness" }, icon: "💪" },
  { id: "personal", label: { en: "Personal", es: "Personal" }, icon: "🌱" },
  { id: "finance", label: { en: "Finance", es: "Finanzas" }, icon: "💰" },
  { id: "projects", label: { en: "Projects", es: "Proyectos" }, icon: "🚀" },
];

export function getTemplatesByCategory(category: string): GoalTemplate[] {
  return GOAL_TEMPLATES.filter((t) => t.category === category);
}
