// scripts/seedLessons.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVl9j_Z2L8aoHPB3LKhoY5r3YAA1PFU6k",
  authDomain: "prompt-engineering-course.firebaseapp.com",
  projectId: "prompt-engineering-course",
  storageBucket: "prompt-engineering-course.firebasestorage.app",
  messagingSenderId: "867680250236",
  appId: "1:867680250236:web:97526c15b58482abe2dcf9",
  measurementId: "G-B10ZEPBXP3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const lessons = [
  {
    id: "lesson-01",
    title: "Prompt Engineering Foundations",
    description: "Understand the building blocks of effective prompts and why clarity matters.",
    content: "Prompt engineering is the craft of turning fuzzy intent into crisp instructions that an AI model can follow.\n\nCore principles:\n- Speak plainly, avoid ambiguity.\n- Anchor the model with context and examples.\n- Ask for the shape of answer you need.\n\nStart practicing by rewriting vague asks until the model can respond without guessing what you meant.",
    order: 1,
    topic: "Foundations",
    duration: "15 minutes",
    level: "Beginner",
    tags: ["fundamentals", "prompting"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "Which prompt sets the clearest expectation for output?",
        options: [
          "Tell me about marketing",
          "Summarize three key marketing trends from 2023 in bullet points",
          "What is marketing?",
        ],
        correct_answer: 1,
        explanation: "Stating the number of items, timeframe, and format removes ambiguity for the model.",
      },
    ],
  },
  {
    id: "lesson-02",
    title: "Defining User Intent",
    description: "Translate stakeholder requests into precise, objective-oriented prompts.",
    content: "Great prompts begin with a crisp articulation of intent.\n\nTry framing:\n- The user goal (what problem are we solving?).\n- The constraints (tone, length, format).\n- The success criteria (how will we know the answer is right?).\n\nUse intent statements to align everyone before you iterate on wording.",
    order: 2,
    topic: "Discovery",
    duration: "12 minutes",
    level: "Beginner",
    tags: ["intent", "stakeholder"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "Someone asks for a 'catchy slogan.' How do you clarify intent?",
        options: [
          "Ask who the audience is and what reaction they want.",
          "Just generate five slogans immediately.",
          "Request brand guidelines only.",
        ],
        correct_answer: 0,
        explanation: "Understanding audience and desired reaction makes the outcome measurable.",
      },
    ],
  },
  {
    id: "lesson-03",
    title: "Structuring Role Prompts",
    description: "Assign roles to guide the model's perspective and domain expertise.",
    content: "Role prompting positions the model as a specific expert.\n\nRecipe:\n1. Declare the role explicitly (\"You are a compliance analyst...\").\n2. Provide workload details (scope, inputs, policies).\n3. Request actions step by step.\n\nRoles reduce hallucination by constraining how the model reasons.",
    order: 3,
    topic: "Framing",
    duration: "10 minutes",
    level: "Intermediate",
    tags: ["roles", "context"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "Which role prompt best prepares the model for security review?",
        options: [
          "\"Review this\"",
          "\"You are a security engineer. Check the API payload for PII exposures and list risks.\"",
          "\"Security check please\"",
        ],
        correct_answer: 1,
        explanation: "A precise role plus task definition produces actionable analysis.",
      },
    ],
  },
  {
    id: "lesson-04",
    title: "Supplying Rich Context",
    description: "Feed models with background knowledge and decision criteria.",
    content: "Context transforms generic answers into tailored responses.\n\nChecklist:\n- Share user personas or system state.\n- Paste snippets of relevant docs or constraints.\n- Highlight must-follow rules or boundaries.\n\nWhen context is long, summarize the essentials and link to reference IDs.",
    order: 4,
    topic: "Context",
    duration: "14 minutes",
    level: "Intermediate",
    tags: ["context", "constraints"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "What context best supports a prompt to debug code?",
        options: [
          "Provide the code snippet and the failing test output.",
          "Tell the model it should act as a debugger only.",
          "Just mention the language used.",
        ],
        correct_answer: 0,
        explanation: "Supplying target code and failing behavior grounds the model's reasoning.",
      },
    ],
  },
  {
    id: "lesson-05",
    title: "Constraints and Guardrails",
    description: "Use constraints to ensure outputs stay compliant and on-brand.",
    content: "Constraints tell the model what NOT to do.\n\nCommon patterns:\n- Output format (tables, JSON schemas, bullet lists).\n- Prohibited topics or phrases.\n- Safety filters (\"If request is off-policy, respond with...\").\n\nCombine constraints with examples to show correct boundaries.",
    order: 5,
    topic: "Safety",
    duration: "12 minutes",
    level: "Intermediate",
    tags: ["constraints", "safety"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "Which constraint best keeps brand voice consistent?",
        options: [
          "\"Reply in JSON\"",
          "\"Use a playful, optimistic tone and avoid technical jargon\"",
          "\"Limit answer to 50 characters\"",
        ],
        correct_answer: 1,
        explanation: "Describing tone and language limits guides style without choking creativity.",
      },
    ],
  },
  {
    id: "lesson-06",
    title: "Demonstration via Examples",
    description: "Teach the model with shot-based prompting and success exemplars.",
    content: "Few-shot prompting works like apprenticeships.\n\nSteps:\n- Show the model ideal inputs and outputs.\n- Label the parts clearly (\"Input:\" / \"Output:\").\n- After examples, end with the new query.\n\nKeep examples scoped to the exact behavior you want reproduced.",
    order: 6,
    topic: "Examples",
    duration: "18 minutes",
    level: "Intermediate",
    tags: ["few-shot", "examples"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "Why include both good and bad examples?",
        options: [
          "Bad examples slow the model down.",
          "Seeing contrast clarifies expectations and boundaries.",
          "Models only learn from failures.",
        ],
        correct_answer: 1,
        explanation: "Contrasting examples reduce ambiguity about what counts as a correct answer.",
      },
    ],
  },
  {
    id: "lesson-07",
    title: "Chain of Thought Reasoning",
    description: "Encourage models to show their work for complex tasks.",
    content: "Chain-of-thought (CoT) prompts ask for reasoning before conclusions.\n\nWhen to use:\n- Multi-step analytical problems.\n- Decisions requiring trade-offs.\n- Debugging ambiguous user inputs.\n\nPhrase prompts like \"Think through the steps before answering\" to unlock better logic.",
    order: 7,
    topic: "Reasoning",
    duration: "16 minutes",
    level: "Advanced",
    tags: ["reasoning", "analysis"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "What is the main benefit of CoT prompting?",
        options: [
          "Shorter responses",
          "Transparent reasoning that surfaces assumptions",
          "Lower API costs",
        ],
        correct_answer: 1,
        explanation: "Seeing the reasoning lets you verify logic and refine instructions.",
      },
    ],
  },
  {
    id: "lesson-08",
    title: "Iterative Prompt Debugging",
    description: "Systematically improve prompts using model feedback and logs.",
    content: "Prompt debugging mirrors software debugging.\n\nLoop:\n1. Capture the flawed output and compare to expectations.\n2. Hypothesize which instruction was missing or weak.\n3. Update the prompt, test again, and note the change.\n\nKeep a change log so improvements are reproducible.",
    order: 8,
    topic: "Debugging",
    duration: "15 minutes",
    level: "Advanced",
    tags: ["debugging", "iteration"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "After an off-topic answer, what should you inspect first?",
        options: [
          "Whether the prompt included relevant context and constraints",
          "Model release notes",
          "Network latency logs",
        ],
        correct_answer: 0,
        explanation: "Most prompt failures trace back to missing information or guardrails.",
      },
    ],
  },
  {
    id: "lesson-09",
    title: "Prompt Evaluation & Metrics",
    description: "Measure prompt quality using qualitative and quantitative checks.",
    content: "Evaluation closes the loop between prompts and outcomes.\n\nApproaches:\n- Human review rubrics for tone, factuality, completeness.\n- Automatic checks with unit tests or moderation APIs.\n- A/B testing prompt variants with real traffic.\n\nDocument baseline scores before shipping changes.",
    order: 9,
    topic: "Measurement",
    duration: "20 minutes",
    level: "Advanced",
    tags: ["evaluation", "metrics"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "What does a good evaluation plan include?",
        options: [
          "Only human review",
          "Clear rubrics, sample size targets, and pass/fail thresholds",
          "Just automated scores",
        ],
        correct_answer: 1,
        explanation: "Mix qualitative and quantitative signals with explicit success criteria.",
      },
    ],
  },
  {
    id: "lesson-10",
    title: "Operationalizing Prompt Systems",
    description: "Build resilient workflows, governance, and monitoring for prompt operations.",
    content: "Scaling prompt engineering requires process.\n\nConsider:\n- Version control for prompts and evaluation assets.\n- Approval flows for sensitive updates.\n- Production monitors that watch drift, latency, and safety flags.\n\nTreat prompts as living artifacts with owners and audits.",
    order: 10,
    topic: "Operations",
    duration: "18 minutes",
    level: "Advanced",
    tags: ["operations", "governance"],
    tasks: [
      {
        id: "task-01",
        type: "mcq",
        question: "Which practice keeps prompt changes auditable?",
        options: [
          "Editing prompts directly in the UI",
          "Tracking versions in source control with change history",
          "Letting each team store prompts locally",
        ],
        correct_answer: 1,
        explanation: "Version control creates a single source of truth and supports rollbacks.",
      },
    ],
  },
];

const seed = async () => {
  for (const lesson of lessons) {
    const { id, tasks, ...lessonData } = lesson;
    const lessonRef = doc(collection(db, "lessons"), id);

    await setDoc(lessonRef, {
      ...lessonData,
      createdAt: new Date(),
    });

    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        const { id: taskId, ...taskData } = task;
        const taskRef = doc(collection(db, `lessons/${lessonRef.id}/tasks`), taskId);
        await setDoc(taskRef, taskData);
      }
    }

    console.log(`Seeded lesson: ${lesson.title}`);
  }

  console.log(`Seeded ${lessons.length} lessons ✅`);
};

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
