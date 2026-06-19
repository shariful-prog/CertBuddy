/**
 * Content compiler for CertBuddy.
 *
 * Convention-based: each folder under `content/` that contains a `cert.json`
 * is one certification. Inside it:
 *   <Domain>/<Chapter>/Overview.md          → rendered study guide
 *   <Domain>/<Chapter>/*Question.json        → per-chapter quiz
 *   Practice/Practice Exams/*.json           → practice exams
 *   Practice/FinalExam/*.json                → final exam
 *
 * Outputs (lazy-loading friendly):
 *   public/data/<slug>.json  → full content for one certification
 *   src/manifest.js          → lightweight index of all certifications
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

marked.setOptions({ gfm: true, breaks: true });

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DATA_DIR = path.join(ROOT, 'public', 'data');
const MANIFEST_PATH = path.join(ROOT, 'src', 'manifest.js');

const PRACTICE_DIR_NAME = 'Practice';
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function isDir(p) {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/**
 * Normalise a raw question into a canonical runtime shape:
 *   { id, type, text, difficulty, options:[{text,correct}], correctIndices:[i], isMulti }
 * Source shape (verified uniform across all DP-700 files):
 *   { type, question, options:{A,B,C,D}, answer:"A", explanation, difficulty }
 */
function normaliseQuestion(q, index) {
  const entries = Array.isArray(q.options)
    ? q.options.map((value, i) => [LETTERS[i], value])
    : Object.entries(q.options || {});

  // Support a single answer letter, an array of letters, or comma-separated letters.
  const answerLetters = (Array.isArray(q.answer) ? q.answer : String(q.answer ?? '').split(','))
    .map((a) => String(a).trim().toUpperCase())
    .filter(Boolean);

  const options = entries.map(([key, value]) => {
    const text = typeof value === 'object' && value !== null ? value.text ?? '' : value;
    const correct =
      (typeof value === 'object' && value !== null && !!value.correct) ||
      answerLetters.includes(String(key).toUpperCase());
    return { text: String(text), correct };
  });

  const correctIndices = options.map((o, i) => (o.correct ? i : -1)).filter((i) => i !== -1);
  const isMulti = correctIndices.length > 1 || q.type === 'multiple-select';

  return {
    id: q.id || `q${index}`,
    type: q.type || (isMulti ? 'multiple-select' : 'single-select'),
    text: q.question || q.text || '',
    difficulty: q.difficulty || null,
    explanation: q.explanation || '',
    options,
    correctIndices,
    isMulti,
  };
}

function loadQuestionsFromFile(filePath) {
  const parsed = readJson(filePath);
  const raw = Array.isArray(parsed) ? parsed : parsed.questions || [];
  return raw.map(normaliseQuestion);
}

/** Find the first non-cert JSON file in a directory (the question bank). */
function findQuestionFile(dir) {
  const files = fs.readdirSync(dir);
  return files.find((f) => f.endsWith('.json') && f !== 'cert.json');
}

function compileChapter(chapterDir, folderName) {
  const mdPath = path.join(chapterDir, 'Overview.md');
  let overviewHtml = '';
  if (fs.existsSync(mdPath)) {
    overviewHtml = marked.parse(fs.readFileSync(mdPath, 'utf8'));
  } else {
    console.warn(`  [warn] no Overview.md in "${folderName}"`);
  }

  let questions = [];
  const qFile = findQuestionFile(chapterDir);
  if (qFile) {
    try {
      questions = loadQuestionsFromFile(path.join(chapterDir, qFile));
    } catch (err) {
      console.error(`  [error] parsing ${qFile}: ${err.message}`);
    }
  }

  return {
    id: slugify(folderName),
    title: folderName,
    overviewHtml,
    questions,
  };
}

function compilePracticeSection(practiceDir) {
  const practiceExams = [];
  let finalExam = null;

  for (const entry of fs.readdirSync(practiceDir)) {
    const sub = path.join(practiceDir, entry);
    if (!isDir(sub)) continue;

    const jsonFiles = fs
      .readdirSync(sub)
      .filter((f) => f.endsWith('.json'))
      .sort();

    const isFinal = /final/i.test(entry);

    for (const file of jsonFiles) {
      const parsed = readJson(path.join(sub, file));
      const title = parsed.module || file.replace(/\.json$/, '');
      const exam = {
        id: slugify(title),
        title,
        questions: (parsed.questions || []).map(normaliseQuestion),
      };
      if (isFinal) {
        finalExam = exam;
      } else {
        practiceExams.push(exam);
      }
    }
  }

  practiceExams.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  return { practiceExams, finalExam };
}

function compileCert(certDir) {
  const config = readJson(path.join(certDir, 'cert.json'));
  const slug = config.slug || slugify(path.basename(certDir));

  const domains = [];
  let practiceExams = [];
  let finalExam = null;

  for (const entry of fs.readdirSync(certDir)) {
    const entryPath = path.join(certDir, entry);
    if (!isDir(entryPath)) continue;

    if (entry === PRACTICE_DIR_NAME) {
      const result = compilePracticeSection(entryPath);
      practiceExams = result.practiceExams;
      finalExam = result.finalExam;
      continue;
    }

    // Otherwise it's a study domain whose children are chapters.
    const chapters = [];
    for (const chapterFolder of fs.readdirSync(entryPath)) {
      const chapterDir = path.join(entryPath, chapterFolder);
      if (!isDir(chapterDir)) continue;
      chapters.push(compileChapter(chapterDir, chapterFolder));
    }
    if (chapters.length) {
      domains.push({ id: slugify(entry), title: entry, chapters });
    }
  }

  domains.sort((a, b) => a.title.localeCompare(b.title));

  const chapterCount = domains.reduce((acc, d) => acc + d.chapters.length, 0);

  const cert = {
    slug,
    code: config.code || slug.toUpperCase(),
    title: config.title || slug,
    fullTitle: config.fullTitle || config.title || slug,
    description: config.description || '',
    domains,
    practiceExams,
    finalExam,
  };

  const summary = {
    slug,
    code: cert.code,
    title: cert.title,
    fullTitle: cert.fullTitle,
    description: cert.description,
    order: config.order ?? 999,
    domainCount: domains.length,
    chapterCount,
    practiceCount: practiceExams.length,
    hasFinalExam: !!finalExam,
  };

  return { cert, summary };
}

function compile() {
  if (!isDir(CONTENT_DIR)) {
    console.error(`content/ directory not found at ${CONTENT_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });

  const summaries = [];
  const certDirs = fs
    .readdirSync(CONTENT_DIR)
    .map((name) => path.join(CONTENT_DIR, name))
    .filter((p) => isDir(p) && fs.existsSync(path.join(p, 'cert.json')));

  if (!certDirs.length) {
    console.error('No certifications found (a cert folder needs a cert.json).');
    process.exit(1);
  }

  for (const certDir of certDirs) {
    console.log(`Compiling certification: ${path.basename(certDir)}`);
    const { cert, summary } = compileCert(certDir);

    const outPath = path.join(PUBLIC_DATA_DIR, `${cert.slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(cert), 'utf8');

    console.log(
      `  → ${summary.domainCount} domains, ${summary.chapterCount} chapters, ` +
        `${summary.practiceCount} practice exams, final exam: ${summary.hasFinalExam}`
    );
    summaries.push(summary);
  }

  summaries.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  const manifest = `// Auto-generated by scripts/compile-data.js. Do not edit manually.
export const certifications = ${JSON.stringify(summaries, null, 2)};
`;
  fs.writeFileSync(MANIFEST_PATH, manifest, 'utf8');

  console.log(`\nWrote ${summaries.length} certification(s) to public/data/ and src/manifest.js`);
}

compile();
