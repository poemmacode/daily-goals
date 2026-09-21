export enum Feature {
  // Free features
  GOAL_CRUD = "goal_crud",
  MILESTONES = "milestones",
  TASKS = "tasks",
  FOCUS_TIMER = "focus_timer",
  CONTRIBUTION_GRAPH = "contribution_graph",
  STREAKS = "streaks",
  BASIC_HEALTH = "basic_health",
  FAILURE_TRACKING = "failure_tracking",
  BASIC_INSIGHTS = "basic_insights",
  WEEKLY_REVIEW_BASIC = "weekly_review_basic",
  GOAL_TEMPLATES = "goal_templates",

  // Pro features
  ADVANCED_ANALYTICS = "advanced_analytics",
  ADAPTIVE_SCHEDULING = "adaptive_scheduling",
  WEEKLY_REVIEW_PRO = "weekly_review_pro",
  GOAL_EXPERIMENTS = "goal_experiments",
  DATA_EXPORT = "data_export",
  CUSTOM_DASHBOARDS = "custom_dashboards",

  // Pro + BYOK AI features
  AI_GOAL_COACH = "ai_goal_coach",
  AI_WEEKLY_REVIEW = "ai_weekly_review",
  AI_CONTENT_ASSISTANT = "ai_content_assistant",
}

export type Tier = "free" | "pro";

export const TIER_FEATURES: Record<Tier, Feature[]> = {
  free: [
    Feature.GOAL_CRUD,
    Feature.MILESTONES,
    Feature.TASKS,
    Feature.FOCUS_TIMER,
    Feature.CONTRIBUTION_GRAPH,
    Feature.STREAKS,
    Feature.BASIC_HEALTH,
    Feature.FAILURE_TRACKING,
    Feature.BASIC_INSIGHTS,
    Feature.WEEKLY_REVIEW_BASIC,
    Feature.GOAL_TEMPLATES,
  ],
  pro: [
    ...Object.values(Feature), // Pro includes all features
  ],
};

export const FEATURE_DESCRIPTIONS: Record<Feature, { title: string; description: string }> = {
  [Feature.GOAL_CRUD]: { title: "Goal Management", description: "Create, edit, and manage your goals" },
  [Feature.MILESTONES]: { title: "Milestones", description: "Break goals into milestones" },
  [Feature.TASKS]: { title: "Tasks", description: "Track individual tasks within milestones" },
  [Feature.FOCUS_TIMER]: { title: "Focus Timer", description: "Timed focus sessions with alarms" },
  [Feature.CONTRIBUTION_GRAPH]: { title: "Contribution Graph", description: "Visual activity heatmap" },
  [Feature.STREAKS]: { title: "Streaks", description: "Track your consecutive completion streaks" },
  [Feature.BASIC_HEALTH]: { title: "Goal Health", description: "Basic health scoring for your goals" },
  [Feature.FAILURE_TRACKING]: { title: "Miss Tracking", description: "Record why you missed a goal" },
  [Feature.BASIC_INSIGHTS]: { title: "Basic Insights", description: "Completion rates and per-goal stats" },
  [Feature.WEEKLY_REVIEW_BASIC]: { title: "Weekly Review", description: "Basic weekly summary" },
  [Feature.GOAL_TEMPLATES]: { title: "Goal Templates", description: "Pre-built goal templates" },
  [Feature.ADVANCED_ANALYTICS]: { title: "Advanced Analytics", description: "Completion trends, patterns, and behavioral insights" },
  [Feature.ADAPTIVE_SCHEDULING]: { title: "Adaptive Scheduling", description: "AI-powered schedule optimization suggestions" },
  [Feature.WEEKLY_REVIEW_PRO]: { title: "Pro Weekly Review", description: "Detailed weekly analysis with trends" },
  [Feature.GOAL_EXPERIMENTS]: { title: "Goal Experiments", description: "A/B test schedule changes" },
  [Feature.DATA_EXPORT]: { title: "Data Export", description: "Export your data as CSV/JSON" },
  [Feature.CUSTOM_DASHBOARDS]: { title: "Custom Dashboards", description: "Personalized dashboard layouts" },
  [Feature.AI_GOAL_COACH]: { title: "AI Goal Coach", description: "Get AI-powered coaching advice (BYOK)" },
  [Feature.AI_WEEKLY_REVIEW]: { title: "AI Weekly Review", description: "AI-generated weekly summaries (BYOK)" },
  [Feature.AI_CONTENT_ASSISTANT]: { title: "AI Content Assistant", description: "AI writing help for SEO content (BYOK)" },
};

export const FREE_UPGRADE_MESSAGES: Partial<Record<Feature, string>> = {
  [Feature.ADVANCED_ANALYTICS]: "Advanced insights are available with Pro.",
  [Feature.ADAPTIVE_SCHEDULING]: "Schedule optimization is available with Pro.",
  [Feature.WEEKLY_REVIEW_PRO]: "Detailed weekly analysis is available with Pro.",
  [Feature.GOAL_EXPERIMENTS]: "Goal experiments are available with Pro.",
  [Feature.DATA_EXPORT]: "Data export is available with Pro.",
  [Feature.CUSTOM_DASHBOARDS]: "Custom dashboards are available with Pro.",
  [Feature.AI_GOAL_COACH]: "AI coaching requires Pro and an OpenAI API key.",
  [Feature.AI_WEEKLY_REVIEW]: "AI weekly review requires Pro and an OpenAI API key.",
  [Feature.AI_CONTENT_ASSISTANT]: "AI content assistant requires Pro and an OpenAI API key.",
};
