/**
 * FRONTEND-ONLY PROTOTYPE DATA
 * ----------------------------
 * Every item below is static, in-memory mock content. There is no database and
 * no API. When the backend is built, replace the exports in this file with
 * fetch calls — the components consume these shapes and nothing else.
 */

export type Subject = {
  id: string;
  code: string;
  name: string;
  icon: string;
  compulsory: boolean;
  questionsInMock: number;
  calculatorAllowed: boolean;
};

export type Topic = { id: string; subjectId: string; name: string; syllabusRef: string };

export type Lesson = {
  id: string;
  topicId: string;
  subjectId: string;
  title: string;
  durationMinutes: number;
  videoUrl: string;
  summary: string;
  transcript: string;
  chapters: { label: string; at: number }[];
  lecturer: string;
  status: "draft" | "in_review" | "published";
  isFreeSample: boolean;
};

export type Question = {
  id: string;
  subjectId: string;
  topicId: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "in_review" | "approved" | "retired";
};

export type Plan = {
  code: "free" | "monthly" | "yearly";
  name: string;
  priceNaira: number;
  interval: "none" | "month" | "year";
  features: string[];
};

export type BadgeDef = {
  code: string;
  name: string;
  description: string;
  category: string;
  rarity: "common" | "rare" | "legendary";
  icon: string;
  criteria: "streak_days" | "questions_answered" | "lessons_completed" | "mocks_completed" | "mock_score" | "diagnostic_complete" | "mistakes_fixed";
  value: number;
};

export const COMPANY = {
  phone: "+234 801 234 5678",
  email: "support@testprepcity.ng",
  address: "Yaba, Lagos, Nigeria",
  whatsapp: "2348012345678",
};

export const BANK_DETAILS = {
  bankName: "Providus Bank",
  accountName: "Test Prep City Ltd",
  accountNumber: "9901234567",
  opayAccountName: "Test Prep City",
  opayNumber: "8101234567",
};

/* ------------------------------- subjects ------------------------------- */

const SUBJECT_SEED: [string, string, string, boolean, number, boolean][] = [
  ["english", "English Language", "📖", true, 60, false],
  ["mathematics", "Mathematics", "➗", false, 40, true],
  ["physics", "Physics", "🔭", false, 40, true],
  ["chemistry", "Chemistry", "⚗️", false, 40, true],
  ["biology", "Biology", "🧬", false, 40, false],
  ["economics", "Economics", "📊", false, 40, true],
  ["commerce", "Commerce", "🏪", false, 40, true],
  ["government", "Government", "🏛️", false, 40, false],
];

export const SUBJECTS: Subject[] = SUBJECT_SEED.map(([code, name, icon, compulsory, questionsInMock, calc]) => ({
  id: code,
  code,
  name,
  icon,
  compulsory,
  questionsInMock,
  calculatorAllowed: calc,
}));

export const ENGLISH_ID = "english";

const TOPIC_NAMES: Record<string, string[]> = {
  english: ["Comprehension", "Lexis and Structure", "Synonyms and Antonyms", "Sentence Interpretation", "Oral Forms", "Concord", "Register and Idioms", "Summary Writing"],
  mathematics: ["Number and Numeration", "Indices and Logarithms", "Algebraic Equations", "Sequences and Series", "Geometry and Mensuration", "Trigonometry", "Calculus", "Statistics and Probability"],
  physics: ["Measurements and Units", "Motion", "Work, Energy and Power", "Heat Energy", "Waves and Sound", "Light and Optics", "Electricity and Magnetism", "Modern Physics"],
  chemistry: ["Separation Techniques", "Atomic Structure", "Chemical Bonding", "Mole Concept", "Acids, Bases and Salts", "Redox and Electrolysis", "Rates and Equilibrium", "Organic Chemistry"],
  biology: ["Cell Biology", "Nutrition", "Transport Systems", "Respiration and Excretion", "Reproduction", "Genetics and Variation", "Ecology", "Microorganisms and Disease"],
  economics: ["Basic Economic Problems", "Demand and Supply", "Theory of Production", "Market Structures", "National Income", "Money and Inflation", "Public Finance", "International Trade"],
  commerce: ["Nature of Commerce", "Trade and Middlemen", "Business Units", "Finance and Banking", "Insurance", "Transport and Warehousing", "Marketing and Advertising", "Business Documents"],
  government: ["Basic Concepts of Government", "Political Ideologies", "Arms of Government", "Constitutions", "Electoral Systems", "Political Parties", "Nigerian Constitutional Development", "International Organisations"],
};

export const TOPICS: Topic[] = SUBJECTS.flatMap((s) =>
  TOPIC_NAMES[s.code].map((name, i) => ({
    id: `${s.code}-t${i + 1}`,
    subjectId: s.id,
    name,
    syllabusRef: `${s.code.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(2, "0")}`,
  })),
);

/* -------------------------------- lessons ------------------------------- */

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
export const LECTURERS = [
  {
    name: "Dr. Adaeze Nwosu",
    credential: "PhD Applied Mathematics, UNILAG · 14 years UTME coaching",
    subjects: "Mathematics, Physics",
    photo: "https://images.pexels.com/photos/16160962/pexels-photo-16160962.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    name: "Mr. Tunde Bakare",
    credential: "MSc Chemistry, OAU · Chief examiner trainer",
    subjects: "Chemistry, Biology",
    photo: "https://images.pexels.com/photos/13392786/pexels-photo-13392786.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    name: "Mrs. Grace Okonkwo",
    credential: "MA English Language, UNN · 11 years classroom teaching",
    subjects: "English, Government",
    photo: "https://images.pexels.com/photos/16160869/pexels-photo-16160869.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    name: "Mr. Ibrahim Sule",
    credential: "MSc Economics, ABU Zaria · CBT item writer",
    subjects: "Economics, Commerce",
    photo: "https://images.pexels.com/photos/8617899/pexels-photo-8617899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

export const LESSONS: Lesson[] = TOPICS.flatMap((t, ti) => {
  const subject = SUBJECTS.find((s) => s.id === t.subjectId)!;
  return [
    {
      id: `${t.id}-l1`,
      topicId: t.id,
      subjectId: t.subjectId,
      title: `${t.name} — core lecture`,
      durationMinutes: 9 + (ti % 7),
      videoUrl: SAMPLE_VIDEO,
      summary: `A complete walk-through of ${t.name} for the JAMB UTME ${subject.name} syllabus: the definitions examiners expect, the three question types that recur, and the fastest reliable method for each.`,
      transcript: `Welcome to ${t.name}. In this lecture we cover the official JAMB syllabus requirements for ${t.name} in ${subject.name}.\n\nFirst we define the key terms and show how examiners phrase them. Next we work three past-question-style items step by step, explaining the reasoning rather than the shortcut alone. Finally we summarise the three mistakes that cost candidates marks on this topic and how to avoid them under exam timing.\n\nRemember: in the UTME you have roughly 40 seconds per question, so the method you practise must be the method you can repeat quickly and accurately.`,
      chapters: [
        { label: "Introduction", at: 0 },
        { label: "Key definitions", at: 20 },
        { label: "Worked examples", at: 40 },
        { label: "Exam traps", at: 60 },
        { label: "Summary", at: 80 },
      ],
      lecturer: LECTURERS[ti % LECTURERS.length].name,
      status: "published" as const,
      isFreeSample: ti % 8 === 0,
    },
    {
      id: `${t.id}-l2`,
      topicId: t.id,
      subjectId: t.subjectId,
      title: `${t.name} — worked past questions`,
      durationMinutes: 8 + ((ti + 3) % 7),
      videoUrl: SAMPLE_VIDEO,
      summary: `Ten UTME-style questions on ${t.name} solved out loud, with the examiner's reasoning made explicit.`,
      transcript: `In this session we solve ten ${t.name} questions in the style of recent UTME papers. For each item we read the stem carefully, identify what is actually being asked, eliminate distractors, and then compute or reason to the answer.\n\nPause the video at each question and attempt it before watching the solution.`,
      chapters: [
        { label: "Questions 1-3", at: 0 },
        { label: "Questions 4-7", at: 30 },
        { label: "Questions 8-10", at: 60 },
      ],
      lecturer: LECTURERS[(ti + 1) % LECTURERS.length].name,
      status: "published" as const,
      isFreeSample: false,
    },
  ];
});

/* ------------------------------- questions ------------------------------ */

const CONCEPTS: Record<string, string[]> = {
  english: [
    "Synonym|a word with the same or nearly the same meaning as another word",
    "Antonym|a word opposite in meaning to another word",
    "Concord|the grammatical agreement between subject and verb in number and person",
    "Idiom|a fixed expression whose meaning cannot be deduced from the individual words",
    "Register|the variety of language appropriate to a particular field or situation",
    "Homophone|a word pronounced like another but different in spelling and meaning",
    "Diphthong|a vowel sound formed by gliding from one vowel position to another",
    "Monophthong|a pure vowel sound produced with a single tongue position",
    "Stress|the extra force given to a syllable in a word when it is pronounced",
    "Intonation|the rise and fall of the voice in connected speech",
    "Clause|a group of words containing a subject and a predicate",
    "Phrase|a group of related words without a subject and a finite verb",
    "Metaphor|a direct comparison in which one thing is said to be another",
    "Simile|a comparison of two things using like or as",
    "Euphemism|a mild expression used in place of a harsh or blunt one",
    "Topic sentence|the sentence that carries the main idea of a paragraph",
  ],
  mathematics: [
    "Index|the power to which a number is raised",
    "Logarithm|the power to which a base must be raised to obtain a given number",
    "Surd|an irrational root that cannot be expressed exactly as a fraction",
    "Variation|a relationship showing how one quantity changes with respect to another",
    "Arithmetic progression|a sequence in which consecutive terms differ by a constant",
    "Geometric progression|a sequence in which each term is a constant multiple of the previous one",
    "Mean|the sum of a set of values divided by the number of values",
    "Median|the middle value of an ordered set of data",
    "Mode|the value that occurs most frequently in a data set",
    "Probability|a measure of the likelihood of an event, from 0 to 1",
    "Permutation|an arrangement of objects in which order matters",
    "Combination|a selection of objects in which order does not matter",
    "Derivative|the instantaneous rate of change of a function with respect to a variable",
    "Integral|the reverse of differentiation, used to find the area under a curve",
    "Bearing|a direction measured clockwise from the north in three digits",
    "Locus|the path traced by a point moving under a given condition",
  ],
  physics: [
    "Scalar quantity|a quantity with magnitude only",
    "Vector quantity|a quantity with both magnitude and direction",
    "Velocity|the rate of change of displacement with time",
    "Acceleration|the rate of change of velocity with time",
    "Momentum|the product of mass and velocity of a body",
    "Inertia|the tendency of a body to resist a change in its state of motion",
    "Work|the product of force and distance moved in the direction of the force",
    "Power|the rate of doing work or transferring energy",
    "Density|mass per unit volume of a substance",
    "Pressure|force acting normally per unit area",
    "Specific heat capacity|the heat required to raise the temperature of 1 kg of a substance by 1 K",
    "Latent heat|the heat absorbed or released during a change of state at constant temperature",
    "Refraction|the bending of light as it passes from one medium to another",
    "Resonance|the large amplitude vibration produced when a body is driven at its natural frequency",
    "Half-life|the time taken for half the nuclei in a radioactive sample to decay",
    "Electromagnetic induction|the production of an emf by a changing magnetic flux",
  ],
  chemistry: [
    "Atomic number|the number of protons in the nucleus of an atom",
    "Mass number|the total number of protons and neutrons in an atom",
    "Isotope|atoms of the same element with different numbers of neutrons",
    "Mole|the amount of substance containing 6.02 x 10^23 particles",
    "Molarity|the number of moles of solute per cubic decimetre of solution",
    "Ionic bond|a bond formed by the transfer of electrons between atoms",
    "Covalent bond|a bond formed by the sharing of electrons between atoms",
    "Electronegativity|the tendency of an atom to attract a shared pair of electrons",
    "Oxidation|the loss of electrons or an increase in oxidation number",
    "Reduction|the gain of electrons or a decrease in oxidation number",
    "Electrolysis|the decomposition of a compound by passing electricity through it",
    "Catalyst|a substance that alters the rate of a reaction without being consumed",
    "Acid|a substance that donates protons in aqueous solution",
    "Base|a substance that accepts protons in aqueous solution",
    "Hydrocarbon|an organic compound containing only carbon and hydrogen",
    "Chromatography|a separation technique based on different rates of movement through a medium",
  ],
  biology: [
    "Cell|the basic structural and functional unit of living organisms",
    "Mitochondrion|the organelle where aerobic respiration releases energy as ATP",
    "Photosynthesis|the process by which green plants make food using light energy",
    "Osmosis|the movement of water from a dilute to a concentrated solution through a semi-permeable membrane",
    "Diffusion|the movement of particles from a region of high to low concentration",
    "Transpiration|the loss of water vapour from the aerial parts of a plant",
    "Homeostasis|the maintenance of a constant internal environment in an organism",
    "Excretion|the removal of metabolic waste products from the body",
    "Enzyme|a protein that speeds up biochemical reactions without being used up",
    "Gene|a unit of heredity carried on a chromosome",
    "Meiosis|a cell division that halves the chromosome number to form gametes",
    "Mitosis|a cell division producing two genetically identical daughter cells",
    "Natural selection|the survival and reproduction of organisms best adapted to their environment",
    "Food chain|a linear sequence showing the transfer of energy from one organism to another",
    "Parasitism|an association in which one organism benefits at the expense of another",
    "Pollination|the transfer of pollen grains from the anther to the stigma",
  ],
  economics: [
    "Scarcity|the limited nature of resources relative to unlimited human wants",
    "Opportunity cost|the value of the next best alternative forgone",
    "Demand|the quantity of a good consumers are willing and able to buy at a given price",
    "Supply|the quantity of a good producers are willing to offer for sale at a given price",
    "Elasticity of demand|the degree of responsiveness of quantity demanded to a change in price",
    "Equilibrium price|the price at which quantity demanded equals quantity supplied",
    "Division of labour|the splitting of production into specialised tasks",
    "Perfect competition|a market with many buyers and sellers of a homogeneous product",
    "Monopoly|a market structure with a single seller and no close substitutes",
    "National income|the total money value of goods and services produced in a country in a year",
    "Inflation|a persistent rise in the general price level of goods and services",
    "Central bank|the apex financial institution that regulates banking and issues currency",
    "Fiscal policy|the use of government spending and taxation to influence the economy",
    "Monetary policy|the control of money supply and interest rates by the central bank",
    "Balance of payments|a record of all economic transactions between a country and the rest of the world",
    "Comparative advantage|the ability to produce a good at a lower opportunity cost than others",
  ],
  commerce: [
    "Commerce|all activities involved in the distribution and exchange of goods and services",
    "Home trade|trade that takes place within the borders of a country",
    "Foreign trade|the exchange of goods and services between countries",
    "Wholesaler|a middleman who buys in bulk from producers and sells in smaller quantities to retailers",
    "Retailer|a middleman who sells goods in small quantities to final consumers",
    "Sole proprietorship|a business owned and controlled by one person",
    "Partnership|a business owned by between two and twenty persons who share profits",
    "Public limited company|a company whose shares can be bought by the general public",
    "Share capital|the money raised by a company through the issue of shares",
    "Insurance|a contract in which an insurer indemnifies the insured against a specified loss",
    "Indemnity|the principle that an insured should be restored to their former financial position",
    "Utmost good faith|the duty of parties to an insurance contract to disclose all material facts",
    "Warehousing|the storage of goods from the time of production until they are needed",
    "Bill of lading|a document that serves as a receipt and title for goods shipped by sea",
    "Trade discount|a reduction in the list price given by a seller to a trader",
    "E-commerce|the buying and selling of goods and services over electronic networks",
  ],
  government: [
    "Government|the machinery through which the state formulates and enforces its policies",
    "State|a politically organised body of people occupying a definite territory with a sovereign government",
    "Sovereignty|the supreme power of a state to make and enforce laws without external control",
    "Democracy|a system of government in which power is derived from the people",
    "Constitution|the body of rules and principles by which a state is governed",
    "Rigid constitution|a constitution that requires a special procedure for amendment",
    "Separation of powers|the division of government functions among the legislature, executive and judiciary",
    "Checks and balances|the mechanism by which each arm of government limits the others",
    "Rule of law|the principle that everyone is subject to the law and equal before it",
    "Federalism|a system in which powers are shared between central and component governments",
    "Franchise|the right to vote in public elections",
    "Political party|an organised group seeking to control government through elections",
    "Pressure group|an organised body that seeks to influence government policy without seeking office",
    "Civil service|the body of permanent officials who implement government policy",
    "Indirect rule|the British colonial policy of governing through traditional rulers",
    "Bicameral legislature|a legislature made up of two chambers",
  ],
};

function cap(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function rotate(correct: string, distractors: string[], seed: number) {
  const opts = [correct, ...distractors].slice(0, 4);
  const r = seed % 4;
  const rotated = [...opts.slice(r), ...opts.slice(0, r)];
  return { options: rotated, correctIndex: rotated.indexOf(correct) };
}

function buildQuestions(): Question[] {
  const out: Question[] = [];
  for (const subject of SUBJECTS) {
    const concepts = CONCEPTS[subject.code];
    const topics = TOPICS.filter((t) => t.subjectId === subject.id);
    const perTopic = Math.ceil(concepts.length / topics.length);
    const quantitative = ["mathematics", "physics", "chemistry", "economics"].includes(subject.code);

    topics.forEach((topic, ti) => {
      const slice = concepts.slice(ti * perTopic, ti * perTopic + perTopic);
      const pool = slice.length ? slice : concepts.slice(0, perTopic);
      let n = 0;

      pool.forEach((raw, ci) => {
        const [term, def] = raw.split("|");
        const others = concepts.filter((c) => c !== raw).map((c) => c.split("|"));
        const otherTerms = others.map((o) => o[0]);
        const otherDefs = others.map((o) => o[1]);
        const pick = (arr: string[], k: number, count: number) =>
          Array.from({ length: count }, (_, i) => arr[(k * 3 + i * 5 + ti) % arr.length]);

        const frames = [
          {
            stem: `Which of the following best describes ${term}?`,
            correct: cap(def),
            distractors: pick(otherDefs, ci, 3).map(cap),
            difficulty: "easy" as const,
            explanation: `${term} is ${def}. The other options describe different concepts within ${topic.name}.`,
          },
          {
            stem: `"${cap(def)}" — this statement defines which of the following?`,
            correct: term,
            distractors: pick(otherTerms, ci + 1, 3),
            difficulty: "easy" as const,
            explanation: `The definition given is that of ${term}.`,
          },
          {
            stem: `In ${topic.name}, which of these statements is TRUE?`,
            correct: `${cap(term)} is ${def}`,
            distractors: pick(otherTerms, ci + 2, 3).map((t, i) => `${cap(t)} is ${otherDefs[(ci + i + 5) % otherDefs.length]}`),
            difficulty: "medium" as const,
            explanation: `Only "${cap(term)} is ${def}" correctly pairs the concept with its meaning.`,
          },
          {
            stem: `Which of the following is NOT a correct statement about ${term}?`,
            correct: `${cap(term)} means ${pick(otherDefs, ci + 4, 1)[0]}`,
            distractors: [
              `${cap(term)} is ${def}`,
              `${cap(term)} is examined under ${topic.name}`,
              `${cap(term)} can be illustrated with examples in ${subject.name}`,
            ],
            difficulty: "hard" as const,
            explanation: `${cap(term)} is ${def} — it does not mean ${pick(otherDefs, ci + 4, 1)[0]}.`,
          },
        ];

        frames.forEach((f, fi) => {
          const { options, correctIndex } = rotate(f.correct, f.distractors, ci + fi + ti);
          out.push({
            id: `${topic.id}-q${++n}`,
            subjectId: subject.id,
            topicId: topic.id,
            stem: f.stem,
            options,
            correctIndex,
            explanation: f.explanation,
            hint: `Recall exactly what ${term} means.`,
            difficulty: f.difficulty,
            status: "approved",
          });
        });
      });

      if (quantitative) {
        for (let i = 0; i < 10; i++) {
          const a = 2 + ((i * 3 + ti) % 9);
          const b = 1 + ((i * 7 + ti) % 11);
          const mode = (i + ti) % 4;
          let stem: string;
          let answer: number;
          let explanation: string;
          if (mode === 0) {
            stem = `Simplify: ${a} × ${b} + ${a}`;
            answer = a * b + a;
            explanation = `${a} × ${b} = ${a * b}; adding ${a} gives ${answer}.`;
          } else if (mode === 1) {
            stem = `If ${a}x + ${b} = ${a * 5 + b}, find x.`;
            answer = 5;
            explanation = `${a}x = ${a * 5 + b} − ${b} = ${a * 5}, so x = 5.`;
          } else if (mode === 2) {
            stem = `Find ${b}% of ${a * 200}.`;
            answer = (b * a * 200) / 100;
            explanation = `${b}% of ${a * 200} = (${b}/100) × ${a * 200} = ${answer}.`;
          } else {
            stem = `A body moves ${a * 20} m in ${b} s. Calculate its average speed in m/s (to the nearest whole number).`;
            answer = Math.round((a * 20) / b);
            explanation = `Speed = distance ÷ time = ${a * 20} ÷ ${b} ≈ ${answer} m/s.`;
          }
          const { options, correctIndex } = rotate(String(answer), [String(answer + 2), String(answer - 1), String(answer * 2)], i + ti);
          out.push({
            id: `${topic.id}-q${++n}`,
            subjectId: subject.id,
            topicId: topic.id,
            stem,
            options,
            correctIndex,
            explanation,
            hint: `Work through the arithmetic one step at a time.`,
            difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
            status: "approved",
          });
        }
      }
    });
  }
  return out;
}

export const QUESTIONS: Question[] = buildQuestions();

/* -------------------------------- lookups ------------------------------- */

export const subjectById = (id: string) => SUBJECTS.find((s) => s.id === id);
export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id);
export const topicsForSubject = (subjectId: string) => TOPICS.filter((t) => t.subjectId === subjectId);
export const lessonsForSubject = (subjectId: string) => LESSONS.filter((l) => l.subjectId === subjectId);
export const questionsForTopic = (topicId: string) => QUESTIONS.filter((q) => q.topicId === topicId);
export const questionsForSubject = (subjectId: string) => QUESTIONS.filter((q) => q.subjectId === subjectId);

/* --------------------------------- plans -------------------------------- */

export const PLANS: Plan[] = [
  {
    code: "free",
    name: "Free",
    priceNaira: 0,
    interval: "none",
    features: ["Baseline diagnostic test", "10 practice questions a day", "Sample lectures", "Basic badges", "View leaderboards"],
  },
  {
    code: "monthly",
    name: "Monthly",
    priceNaira: 4500,
    interval: "month",
    features: ["All lectures in your 4 subjects", "Unlimited Micro Practice", "Unlimited CBT mocks", "Full analytics & insights", "Full gamification", "Cancel any time"],
  },
  {
    code: "yearly",
    name: "Yearly",
    priceNaira: 36000,
    interval: "year",
    features: ["Everything in Monthly", "12 months of access", "Lower effective monthly price", "Priority support", "Printable progress reports"],
  },
];

export const FREE_DAILY_PRACTICE_LIMIT = 10;

/* -------------------------------- badges -------------------------------- */

export const BADGES: BadgeDef[] = [
  { code: "streak3", name: "3-Day Streak", description: "Study three days in a row", category: "Consistency", rarity: "common", icon: "🔥", criteria: "streak_days", value: 3 },
  { code: "streak7", name: "7-Day Streak", description: "A full week of daily goals", category: "Consistency", rarity: "common", icon: "🔥", criteria: "streak_days", value: 7 },
  { code: "streak30", name: "30-Day Streak", description: "Thirty days without missing", category: "Consistency", rarity: "rare", icon: "🔥", criteria: "streak_days", value: 30 },
  { code: "streak100", name: "100-Day Streak", description: "One hundred days of discipline", category: "Consistency", rarity: "legendary", icon: "💎", criteria: "streak_days", value: 100 },
  { code: "first_lecture", name: "First Lecture", description: "Complete your first lecture", category: "Milestones", rarity: "common", icon: "🎬", criteria: "lessons_completed", value: 1 },
  { code: "diagnostic_done", name: "Diagnostic Complete", description: "Finish the baseline diagnostic", category: "Milestones", rarity: "common", icon: "🧭", criteria: "diagnostic_complete", value: 1 },
  { code: "first_mock", name: "First Mock", description: "Complete a full 180-question mock", category: "Milestones", rarity: "common", icon: "🖥️", criteria: "mocks_completed", value: 1 },
  { code: "q1000", name: "1,000 Questions", description: "Answer 1,000 practice questions", category: "Milestones", rarity: "rare", icon: "🧠", criteria: "questions_answered", value: 1000 },
  { code: "topic_master", name: "Topic Master", description: "Reach 90% mastery in any topic", category: "Mastery", rarity: "rare", icon: "🎯", criteria: "questions_answered", value: 300 },
  { code: "mock200", name: "First 200+ Mock", description: "Score 200 or more in a full mock", category: "Performance", rarity: "common", icon: "🥉", criteria: "mock_score", value: 200 },
  { code: "mock250", name: "First 250+ Mock", description: "Score 250 or more in a full mock", category: "Performance", rarity: "rare", icon: "🥈", criteria: "mock_score", value: 250 },
  { code: "mock300", name: "300 Club", description: "Score 300 or more in a full mock", category: "Performance", rarity: "legendary", icon: "🥇", criteria: "mock_score", value: 300 },
  { code: "mistake_fixer", name: "Mistake Fixer", description: "Correctly review 50 previously missed questions", category: "Effort", rarity: "rare", icon: "🩹", criteria: "mistakes_fixed", value: 50 },
  { code: "lectures25", name: "Scholar's Shelf", description: "Complete 25 lectures", category: "Effort", rarity: "rare", icon: "📚", criteria: "lessons_completed", value: 25 },
];

/* ------------------------------ course data ----------------------------- */

export const COURSE_REQUIREMENTS = [
  { course: "Medicine and Surgery", institution: "University of Lagos", cutoff: 280, requiredSubjects: ["English Language", "Biology", "Chemistry", "Physics"] },
  { course: "Law", institution: "University of Ibadan", cutoff: 260, requiredSubjects: ["English Language", "Government", "Economics", "Commerce"] },
  { course: "Computer Science", institution: "Obafemi Awolowo University", cutoff: 250, requiredSubjects: ["English Language", "Mathematics", "Physics", "Chemistry"] },
  { course: "Accounting", institution: "Ahmadu Bello University", cutoff: 230, requiredSubjects: ["English Language", "Mathematics", "Economics", "Commerce"] },
  { course: "Mechanical Engineering", institution: "University of Nigeria, Nsukka", cutoff: 245, requiredSubjects: ["English Language", "Mathematics", "Physics", "Chemistry"] },
  { course: "Economics", institution: "University of Benin", cutoff: 225, requiredSubjects: ["English Language", "Mathematics", "Economics", "Government"] },
  { course: "Nursing Science", institution: "University of Ilorin", cutoff: 255, requiredSubjects: ["English Language", "Biology", "Chemistry", "Physics"] },
  { course: "Political Science", institution: "Bayero University Kano", cutoff: 210, requiredSubjects: ["English Language", "Government", "Economics", "Commerce"] },
];

/* --------------------------- events & articles -------------------------- */

const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

export const EVENTS = [
  { id: "e1", title: "Free UTME Mathematics Clinic (Webinar)", startsAt: inDays(7), location: "Online — Zoom", link: "https://example.com/webinar", description: "Two hours on the ten Mathematics topics that appear in almost every UTME paper.", status: "published" },
  { id: "e2", title: "National Free Mock Day", startsAt: inDays(14), location: "Online — Test Prep City CBT Center", link: "/diagnostic", description: "Sit a full 180-question mock at the same time as thousands of other candidates.", status: "published" },
  { id: "e3", title: "Choosing Your Course & Combination (Lagos)", startsAt: inDays(21), location: "Yaba, Lagos", link: "", description: "A free in-person clinic on subject combinations and course cut-offs.", status: "published" },
];

export const POSTS = [
  {
    slug: "how-to-choose-your-utme-subject-combination",
    title: "How to choose your UTME subject combination",
    excerpt: "English is compulsory. The other three decide which courses you can even apply for. Here is how to pick without regret.",
    author: "Mrs. Grace Okonkwo",
    date: "12 January 2026",
    body: "English Language is compulsory for every UTME candidate, so the real decision is the other three subjects.\n\nStart from the course, not the subject. Look up the brochure requirements for the course you want at the institutions you want, then work backwards.\n\nIf Medicine is the goal, Biology, Chemistry and Physics are effectively fixed. For Law, Government and Literature carry most of the weight. For Accounting and Economics, Mathematics is non-negotiable.\n\nNext, be honest about your current level. A subject you enjoy but score 40% in will cost you more than a subject you tolerate and score 70% in. Take a diagnostic before you commit.\n\nFinally, remember you can change a subject on Test Prep City twice — and your progress in a dropped subject is kept, so nothing is wasted.",
  },
  {
    slug: "what-a-good-utme-study-week-looks-like",
    title: "What a good UTME study week looks like",
    excerpt: "Ten focused hours beat thirty scattered ones. A realistic weekly template for candidates still in school.",
    author: "Dr. Adaeze Nwosu",
    date: "28 January 2026",
    body: "Most candidates overestimate what they can do in a day and underestimate what they can do in a term.\n\nA workable week: four weekday evenings of 75 minutes, one Saturday block of three hours, Sunday off. That is ten hours.\n\nSpend the weekday evenings on one lecture plus a ten-question drill on the same topic. The repetition of watching, then immediately practising, is what moves mastery.\n\nUse the Saturday block for a timed paper: either a single-subject test or, every second week, a full 180-question mock. Review every wrong answer the same day while the reasoning is fresh.\n\nTrack the predicted score, not your feelings. If the number is not moving, change what you are practising, not how hard you are trying.",
  },
  {
    slug: "the-40-second-rule-utme-timing",
    title: "The 40-second rule: timing in the UTME",
    excerpt: "180 questions in 120 minutes is 40 seconds each. Here is how to build that speed safely.",
    author: "Mr. Ibrahim Sule",
    date: "9 February 2026",
    body: "The UTME gives you about 40 seconds per question. Most candidates lose marks not because they do not know the work, but because they spend four minutes on one Mathematics item and then rush twenty English questions.\n\nTrain with a timer from the start. In practice sessions, aim to finish ten questions in seven minutes.\n\nUse the flag button in mocks. If an item is not yielding in 60 seconds, flag it, move on, and come back with whatever time is left.\n\nFinally, check your time-per-question analytics after every mock. If one topic is consistently slow, the problem is method, not effort — go back to the lecture for that topic.",
  },
];

/* ------------------- mock operational data for Super Admin -------------- */

export const DEMO_USERS = [
  { id: "u1", name: "Chidi Okeke", email: "student@testprepcity.ng", phone: "+2348098765432", role: "student", status: "active", school: "Command Secondary School, Ikeja", state: "Lagos", nickname: "ChidiCodes", minor: true, consent: true, joined: "2026-01-04" },
  { id: "u2", name: "Aisha Bello", email: "aisha.b@example.com", phone: "+2348031112222", role: "student", status: "active", school: "Queen Amina College", state: "Kaduna", nickname: "AishaB", minor: true, consent: true, joined: "2026-01-09" },
  { id: "u3", name: "Emeka Nwankwo", email: "emeka.n@example.com", phone: "+2348033334444", role: "student", status: "active", school: "Dennis Memorial Grammar School", state: "Anambra", nickname: "EmekaX", minor: false, consent: true, joined: "2026-01-11" },
  { id: "u4", name: "Fatima Yusuf", email: "fatima.y@example.com", phone: "+2348035556666", role: "student", status: "suspended", school: "Government Girls College", state: "Kano", nickname: "FatiY", minor: true, consent: false, joined: "2026-01-15" },
  { id: "u5", name: "Tolu Adeyemi", email: "tolu.a@example.com", phone: "+2348037778888", role: "student", status: "active", school: "Mayflower School", state: "Ogun", nickname: "ToluA", minor: false, consent: true, joined: "2026-01-19" },
  { id: "u6", name: "Blessing Eze", email: "blessing.e@example.com", phone: "+2348039990000", role: "student", status: "active", school: "Federal Science College", state: "Rivers", nickname: "BeeEze", minor: true, consent: true, joined: "2026-01-23" },
  { id: "u7", name: "Amara Admin", email: "admin@testprepcity.ng", phone: "+2348012345678", role: "super_admin", status: "active", school: "—", state: "Lagos", nickname: "Amara", minor: false, consent: true, joined: "2025-12-01" },
];

export const DEMO_TRANSFER_CLAIMS = [
  { id: "tc1", studentName: "Aisha Bello", channel: "bank_transfer", amount: 4500, reference: "TPC-LZ3K91-A7F2D", senderName: "Musa Bello", bankRef: "PRV-889213", status: "pending", createdAt: "2026-02-10 09:14" },
  { id: "tc2", studentName: "Emeka Nwankwo", channel: "opay", amount: 36000, reference: "TPC-LZ3M22-B1C9E", senderName: "Ngozi Nwankwo", bankRef: "OPY-554120", status: "pending", createdAt: "2026-02-10 10:02" },
  { id: "tc3", studentName: "Tolu Adeyemi", channel: "bank_transfer", amount: 4500, reference: "TPC-LZ2X40-C8D1A", senderName: "Tolu Adeyemi", bankRef: "PRV-881140", status: "approved", createdAt: "2026-02-08 16:45" },
];

export const DEMO_TRANSACTIONS = [
  { id: "p1", date: "2026-02-10", student: "Aisha Bello", reference: "TPC-LZ3K91-A7F2D", amount: 4500, method: "bank_transfer", status: "pending" },
  { id: "p2", date: "2026-02-10", student: "Emeka Nwankwo", reference: "TPC-LZ3M22-B1C9E", amount: 36000, method: "opay", status: "pending" },
  { id: "p3", date: "2026-02-09", student: "Blessing Eze", reference: "TPC-LZ3A05-F3E7C", amount: 4500, method: "paystack", status: "confirmed" },
  { id: "p4", date: "2026-02-08", student: "Tolu Adeyemi", reference: "TPC-LZ2X40-C8D1A", amount: 4500, method: "bank_transfer", status: "confirmed" },
  { id: "p5", date: "2026-02-05", student: "Chidi Okeke", reference: "TPC-LZ1Q77-D2B4F", amount: 36000, method: "paystack", status: "refunded" },
];

export const DEMO_INTEGRITY_FLAGS = [
  { id: "f1", nickname: "SpeedyG", action: "practice_session", amount: 64, reason: "20 answers under 1.2s each", at: "2026-02-10 08:12" },
  { id: "f2", nickname: "AishaB", action: "practice_session", amount: 48, reason: "Repeated identical question set ×6", at: "2026-02-09 21:40" },
  { id: "f3", nickname: "Ghost01", action: "mock_complete", amount: 180, reason: "Duplicate-account signal (same device)", at: "2026-02-09 18:03" },
];

export const DEMO_LEADERBOARD = [
  { nickname: "AishaB", avatar: "🦁", xp: 1840, bestMock: 268 },
  { nickname: "EmekaX", avatar: "🚀", xp: 1620, bestMock: 254 },
  { nickname: "BeeEze", avatar: "⭐", xp: 1475, bestMock: 241 },
  { nickname: "ToluA", avatar: "🧠", xp: 1310, bestMock: 233 },
  { nickname: "FatiY", avatar: "📚", xp: 1180, bestMock: 228 },
  { nickname: "KemiShine", avatar: "🐬", xp: 1025, bestMock: 219 },
  { nickname: "SadiqM", avatar: "🏆", xp: 960, bestMock: 211 },
  { nickname: "NnamdiP", avatar: "🦉", xp: 870, bestMock: 205 },
  { nickname: "ZainabQ", avatar: "⭐", xp: 740, bestMock: 198 },
  { nickname: "PeterO", avatar: "🚀", xp: 615, bestMock: 190 },
];

export const DEMO_ADMIN_STATS = {
  students: 1284,
  dailyActive: 412,
  weeklyActive: 893,
  signups7d: 168,
  paidSubscriptions: 309,
  revenueNaira: 2_845_500,
  mocksSubmitted: 1_907,
  funnel: [
    ["Visits", 18420],
    ["Diagnostic started", 4310],
    ["Diagnostic completed", 3185],
    ["Signups", 1284],
    ["Payments", 309],
    ["Weekly active", 893],
    ["Mock completions", 1907],
  ] as [string, number][],
  retention: { d7: 168, d30: 522, all: 1284 },
  avgScoreGain: 38,
  cohortWithTwoMocks: 418,
};

export const DEMO_NOTIFICATION_TEMPLATES = [
  { id: "n1", code: "streak_at_risk", channel: "push", segment: "streak_at_risk", subject: "Your streak ends tonight", body: "Hi {{name}}, 10 questions keeps your {{streak}}-day streak alive.", active: true },
  { id: "n2", code: "study_plan_reminder", channel: "push", segment: "all", subject: "Today's three actions are ready", body: "Hi {{name}}, your plan takes about 35 minutes today.", active: true },
  { id: "n3", code: "mock_reminder", channel: "sms", segment: "paid", subject: "Weekend mock", body: "Hi {{name}}, sit a full mock this weekend to update your predicted score.", active: true },
  { id: "n4", code: "badge_earned", channel: "push", segment: "all", subject: "New badge unlocked", body: "Well done {{name}} — you earned {{badge}}.", active: true },
  { id: "n5", code: "payment_receipt", channel: "email", segment: "all", subject: "Your Test Prep City receipt", body: "Thank you {{name}}. Reference {{reference}}, amount {{amount}}.", active: true },
  { id: "n6", code: "renewal_reminder", channel: "sms", segment: "expiring", subject: "Access expires in {{days}} days", body: "Hi {{name}}, renew in one tap: {{link}}", active: true },
];

export const DEMO_AUDIT_LOG = [
  { id: "a1", at: "2026-02-10 10:22", actor: "Amara Admin", action: "transfer.approved", entity: "transfer_claim tc3" },
  { id: "a2", at: "2026-02-10 09:58", actor: "Amara Admin", action: "user.impersonate_readonly", entity: "user u2" },
  { id: "a3", at: "2026-02-09 17:31", actor: "Amara Admin", action: "question.approved", entity: "question phy-t2-q14" },
  { id: "a4", at: "2026-02-09 15:04", actor: "Amara Admin", action: "plan.updated", entity: "plan monthly" },
  { id: "a5", at: "2026-02-08 11:47", actor: "Amara Admin", action: "payment.refunded", entity: "payment p5" },
  { id: "a6", at: "2026-02-08 09:12", actor: "system", action: "backup.completed", entity: "database" },
];

export const NIGERIAN_STATES = [
  "Abia", "Abuja FCT", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

export const FAQS = [
  { q: "How do I choose my four subjects?", a: "English is compulsory and pre-selected. You add three more from Mathematics, Physics, Chemistry, Biology, Economics, Commerce and Government. Your whole dashboard follows that combination." },
  { q: "What does the free plan include?", a: "The baseline diagnostic test, limited daily practice, a sample of lectures, basic badges and leaderboard viewing." },
  { q: "How can I pay?", a: "Paystack (card), direct bank transfer and Opay transfer. Monthly renews automatically by card; yearly is paid once for 12 months." },
  { q: "Does it work on a small data plan?", a: "Yes. Video quality starts at 240p, there is an audio-only mode, and mocks keep running offline and sync when you reconnect." },
];
