export type Course = {
  id: string;
  name: string;
  utmeSubjects: string[];
};

export type Institution = {
  id: string;
  name: string;
  shortName: string;
  state: string;
};

const E = "English";

// Common JAMB subject combinations. Some courses accept alternatives,
// so confirm each against the current JAMB brochure before launch.
export const COURSES: Course[] = [
  { id: "medicine-and-surgery", name: "Medicine and Surgery", utmeSubjects: [E, "Biology", "Chemistry", "Physics"] },
  { id: "nursing-science", name: "Nursing Science", utmeSubjects: [E, "Biology", "Chemistry", "Physics"] },
  { id: "pharmacy", name: "Pharmacy", utmeSubjects: [E, "Biology", "Chemistry", "Physics"] },
  { id: "biochemistry", name: "Biochemistry", utmeSubjects: [E, "Biology", "Chemistry", "Physics"] },
  { id: "microbiology", name: "Microbiology", utmeSubjects: [E, "Biology", "Chemistry", "Physics"] },
  { id: "computer-science", name: "Computer Science", utmeSubjects: [E, "Mathematics", "Physics", "Chemistry"] },
  { id: "electrical-engineering", name: "Electrical/Electronic Engineering", utmeSubjects: [E, "Mathematics", "Physics", "Chemistry"] },
  { id: "mechanical-engineering", name: "Mechanical Engineering", utmeSubjects: [E, "Mathematics", "Physics", "Chemistry"] },
  { id: "civil-engineering", name: "Civil Engineering", utmeSubjects: [E, "Mathematics", "Physics", "Chemistry"] },
  { id: "architecture", name: "Architecture", utmeSubjects: [E, "Mathematics", "Physics", "Chemistry"] },
  { id: "law", name: "Law", utmeSubjects: [E, "Literature in English", "Government", "Christian Religious Studies"] },
  { id: "accounting", name: "Accounting", utmeSubjects: [E, "Mathematics", "Economics", "Government"] },
  { id: "economics", name: "Economics", utmeSubjects: [E, "Mathematics", "Economics", "Government"] },
  { id: "business-administration", name: "Business Administration", utmeSubjects: [E, "Mathematics", "Economics", "Government"] },
  { id: "mass-communication", name: "Mass Communication", utmeSubjects: [E, "Literature in English", "Government", "Economics"] },
];

export const INSTITUTIONS: Institution[] = [
  { id: "unilag", name: "University of Lagos", shortName: "UNILAG", state: "Lagos" },
  { id: "ui", name: "University of Ibadan", shortName: "UI", state: "Oyo" },
  { id: "oau", name: "Obafemi Awolowo University", shortName: "OAU", state: "Osun" },
  { id: "unn", name: "University of Nigeria, Nsukka", shortName: "UNN", state: "Enugu" },
  { id: "abu", name: "Ahmadu Bello University", shortName: "ABU", state: "Kaduna" },
  { id: "uniben", name: "University of Benin", shortName: "UNIBEN", state: "Edo" },
  { id: "unilorin", name: "University of Ilorin", shortName: "UNILORIN", state: "Kwara" },
  { id: "uniport", name: "University of Port Harcourt", shortName: "UNIPORT", state: "Rivers" },
  { id: "uniabuja", name: "University of Abuja", shortName: "UNIABUJA", state: "FCT" },
  { id: "futminna", name: "Federal University of Technology, Minna", shortName: "FUTMINNA", state: "Niger" },
  { id: "futa", name: "Federal University of Technology, Akure", shortName: "FUTA", state: "Ondo" },
  { id: "futo", name: "Federal University of Technology, Owerri", shortName: "FUTO", state: "Imo" },
  { id: "buk", name: "Bayero University, Kano", shortName: "BUK", state: "Kano" },
  { id: "unizik", name: "Nnamdi Azikiwe University", shortName: "UNIZIK", state: "Anambra" },
  { id: "unical", name: "University of Calabar", shortName: "UNICAL", state: "Cross River" },
  { id: "unijos", name: "University of Jos", shortName: "UNIJOS", state: "Plateau" },
  { id: "lasu", name: "Lagos State University", shortName: "LASU", state: "Lagos" },
  { id: "covenant", name: "Covenant University", shortName: "CU", state: "Ogun" },
  { id: "babcock", name: "Babcock University", shortName: "BU", state: "Ogun" },
];

/**
 * Which courses each school offers, by course id.
 * Schools not listed here fall back to the full COURSES list below.
 * Replace these with the real lists per school as you verify them.
 */
const OFFERED: Record<string, string[]> = {
  // unilag: ["medicine-and-surgery", "law", "computer-science"],
};

// The only two functions the UI calls. If a backend API arrives later,
// change these and nothing else.
export function getInstitutions(): Institution[] {
  return INSTITUTIONS;
}

export function getCourses(institutionId: string): Course[] {
  const ids = OFFERED[institutionId];
  return ids ? COURSES.filter((c) => ids.includes(c.id)) : COURSES;
}