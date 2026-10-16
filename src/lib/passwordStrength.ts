// Password strength scoring for the on-screen meter. Advisory only: the server enforces
// the hard minimum (6 characters for customers, 12 for the admin).

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export type Strength = {
  score: StrengthLevel; // 0 too short · 1 weak · 2 fair · 3 good · 4 strong
  label: "Too short" | "Weak" | "Fair" | "Good" | "Strong";
  checks: { label: string; ok: boolean }[];
  hint?: string;
};

const COMMON = new Set([
  "password", "password1", "password123", "123456", "1234567", "12345678", "123456789", "1234567890",
  "qwerty", "qwerty123", "abc123", "111111", "000000", "iloveyou", "admin", "welcome", "letmein",
  "monkey", "dragon", "sunshine", "princess", "football", "baby123", "india123", "funkykidz",
]);

const SEQUENCES = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function looksPredictable(pw: string): boolean {
  const lower = pw.toLowerCase();
  if (COMMON.has(lower)) return true;
  if (/^(.)\1+$/.test(pw)) return true; // "aaaaaa"
  return SEQUENCES.some((seq) => lower.length >= 5 && (seq.includes(lower) || seq.split("").reverse().join("").includes(lower)));
}

/**
 * @param minLength  shortest password the server accepts
 * @param goodLength length we recommend (shown in the checklist)
 * @param personal   things the password shouldn't contain (name, email, phone)
 */
export function passwordStrength(
  pw: string,
  { minLength = 6, goodLength = 8, personal = [] as string[] } = {}
): Strength {
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  const checks = [
    { label: `${goodLength}+ characters`, ok: pw.length >= goodLength },
    { label: "Upper & lower case", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: "A number", ok: /\d/.test(pw) },
    { label: "A symbol (!@#…)", ok: /[^A-Za-z0-9]/.test(pw) },
  ];

  if (pw.length < minLength) {
    return { score: 0, label: "Too short", checks, hint: `Use at least ${minLength} characters.` };
  }

  let points = 0;
  if (pw.length >= goodLength) points++;
  if (pw.length >= goodLength + 4) points++;
  if (classes >= 3) points++;
  if (classes === 4 || pw.length >= 16) points++;

  const lower = pw.toLowerCase();
  // Check each word of the name / email / phone separately ("Lakshmi Priya" → lakshmi, priya).
  const personalHit = personal
    .flatMap((p) => p.toLowerCase().split(/[^a-z0-9]+/))
    .filter((p) => p.length >= 4)
    .some((p) => lower.includes(p));

  let hint: string | undefined;
  if (looksPredictable(pw)) {
    points = Math.min(points, 1);
    hint = "This is a very common password — pick something less guessable.";
  } else if (personalHit) {
    points = Math.min(points, 1);
    hint = "Avoid using your name, email or phone number.";
  } else if (points < 3) {
    hint = "Add more characters or mix in numbers and symbols.";
  }

  const score = Math.max(1, Math.min(4, points)) as StrengthLevel;
  const label = (["Too short", "Weak", "Fair", "Good", "Strong"] as const)[score];
  return { score, label, checks, hint };
}
