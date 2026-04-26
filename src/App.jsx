import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, AlertTriangle, ChevronRight, Mail, Phone, Briefcase, Lock, 
  ShieldAlert, LogOut, CheckCircle2, Zap, PenTool, X, KeyRound, User, BookOpen, FastForward
} from 'lucide-react';

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://hbkceapaopwxbcolpegd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhia2NlYXBhb3B3eGJjb2xwZWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODAxMTEsImV4cCI6MjA5Mjc1NjExMX0.MhUnLQiIXupAsb5zLNAu8dLB9QwMi-8sIxyp0TR7rLA";
// Note: Service Role key is used client-side here exclusively to bypass the RLS restriction on Admin reads for this standalone environment.
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhia2NlYXBhb3B3eGJjb2xwZWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE4MDExMSwiZXhwIjoyMDkyNzU2MTExfQ.E3vx3sSKryvv7v449e_pVdzV0ixIENcOKv6OUxCHvak";

// --- API LAYER (Manual Upsert Logic to Guarantee 1 Row) ---
const api = {
  headers: {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  get: async (table: string, query: string) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: api.headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (table: string, body: any) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: 'POST', headers: api.headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  patch: async (table: string, query: string, body: any) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { method: 'PATCH', headers: api.headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

// --- STYLING ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
  
  :root {
    --bg-dark: #000000;
    --card-bg: #0a0a0a;
    --border-color: #222222;
    --text-main: #ffffff;
    --text-muted: #888888;
  }

  body, html {
    font-family: 'Poppins', sans-serif;
    background-color: #000000 !important;
    color: var(--text-main);
    margin: 0;
    height: 100%;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    z-index: 0;
    animation: floatOrb 25s infinite ease-in-out alternate;
    opacity: 0.3;
    pointer-events: none;
  }
  .orb-1 { width: 40vw; height: 40vw; background: rgba(255, 255, 255, 0.04); top: -10%; left: -10%; animation-delay: 0s; }
  .orb-2 { width: 35vw; height: 35vw; background: rgba(200, 200, 200, 0.03); bottom: -10%; right: -10%; animation-delay: -5s; }
  .orb-3 { width: 30vw; height: 30vw; background: rgba(255, 255, 255, 0.05); top: 40%; left: 50%; animation-delay: -10s; }

  @keyframes floatOrb {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(5%, 10%) scale(1.1); }
    100% { transform: translate(-5%, -5%) scale(0.9); }
  }

  .minimal-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s ease;
  }
  .minimal-card:hover { border-color: #444; }

  .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

  .slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }

  .minimal-input { background: transparent; border: 1px solid #333; transition: all 0.3s ease; }
  .minimal-input:focus { border-color: #fff; background: #050505; box-shadow: 0 0 15px rgba(255,255,255,0.05); }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg-dark); }
  ::-webkit-scrollbar-thumb { background: #333; }
  ::-webkit-scrollbar-thumb:hover { background: #fff; }
`;

// --- QUESTION BANK (100% Auto-Graded) ---
type Question = {
  id: string; section: "MCQ" | "DEBUGGING"; difficulty: "Medium" | "Tough" | "Practical";
  type: "single" | "multiple"; question: string; options: string[]; correctAnswers: string[];
  maxScore: number;
};

const QUESTIONS: Question[] = [
  // 30 MCQs
  { id: "q1", section: "MCQ", difficulty: "Medium", type: "single", question: "Which code correctly aggregates amount by id?\nrecords = [{id: 1, amount: 100}, {id: 2, amount: 200}, {id: 1, amount: 50}]", options: ["result = {}; for r in records: result[r['id']] = r['amount']", "result = {}; for r in records: result[r['id']] = result.get(r['id'], 0) + r['amount']", "result = []; for r in records: result[r['id']] += r['amount']", "result = set(records)"], correctAnswers: ["result = {}; for r in records: result[r['id']] = result.get(r['id'], 0) + r['amount']"], maxScore: 1.5 },
  { id: "q2", section: "MCQ", difficulty: "Medium", type: "single", question: "What is the best way to handle a bad row in a large ETL file without stopping the entire job?", options: ["Ignore all errors silently", "Wrap row-level parsing in try/except, log the bad row, continue processing", "Restart the pipeline every time an error occurs", "Delete the source file"], correctAnswers: ["Wrap row-level parsing in try/except, log the bad row, continue processing"], maxScore: 1.5 },
  { id: "q3", section: "MCQ", difficulty: "Medium", type: "multiple", question: "Which are good practices while writing a Python ETL script?", options: ["Validate input schema before transformation", "Hardcode credentials inside the script", "Use logging instead of only print statements", "Separate extraction, transformation, and loading logic into functions", "Ignore duplicate records"], correctAnswers: ["Validate input schema before transformation", "Use logging instead of only print statements", "Separate extraction, transformation, and loading logic into functions"], maxScore: 1.5 },
  { id: "q4", section: "MCQ", difficulty: "Medium", type: "single", question: "You need to process a 20GB CSV file on a machine with 8GB RAM. What is the best approach?", options: ["Load the full file into a list", "Use chunked processing / streaming", "Convert the file into JSON first", "Use nested loops for every row"], correctAnswers: ["Use chunked processing / streaming"], maxScore: 1.5 },
  { id: "q5", section: "MCQ", difficulty: "Medium", type: "single", question: "Why should ETL logic be split into functions?", options: ["To make the code longer", "To improve readability, testing, and reuse", "To avoid using Python libraries", "To reduce logging"], correctAnswers: ["To improve readability, testing, and reuse"], maxScore: 1.5 },
  { id: "q6", section: "MCQ", difficulty: "Medium", type: "single", question: "BigQuery is best described as:", options: ["A row-oriented OLTP database", "A columnar analytical data warehouse", "A key-value cache", "A file storage system only"], correctAnswers: ["A columnar analytical data warehouse"], maxScore: 1.5 },
  { id: "q7", section: "MCQ", difficulty: "Medium", type: "single", question: "Which action usually helps reduce BigQuery query cost?", options: ["Using SELECT * on large tables", "Partitioning tables and filtering on partition columns", "Removing all WHERE clauses", "Running the same query repeatedly without caching"], correctAnswers: ["Partitioning tables and filtering on partition columns"], maxScore: 1.5 },
  { id: "q8", section: "MCQ", difficulty: "Tough", type: "multiple", question: "Which techniques can improve BigQuery performance?", options: ["Partitioning large fact tables", "Clustering on frequently filtered columns", "Avoiding unnecessary SELECT *", "Using cross joins everywhere", "Filtering early in CTEs/subqueries"], correctAnswers: ["Partitioning large fact tables", "Clustering on frequently filtered columns", "Avoiding unnecessary SELECT *", "Filtering early in CTEs/subqueries"], maxScore: 1.5 },
  { id: "q9", section: "MCQ", difficulty: "Medium", type: "single", question: "What does ROW_NUMBER() do?", options: ["Counts all rows in a table", "Assigns a unique sequential number within a partition", "Deletes duplicates automatically", "Creates a primary key constraint"], correctAnswers: ["Assigns a unique sequential number within a partition"], maxScore: 1.5 },
  { id: "q10", section: "MCQ", difficulty: "Tough", type: "single", question: "You need to keep only the latest record per customer based on updated_at. Which is the best approach?", options: ["GROUP BY customer_id without ordering", "Use ROW_NUMBER() OVER(PARTITION BY customer_id ORDER BY updated_at DESC)", "Use DISTINCT *", "Use ORDER BY updated_at only"], correctAnswers: ["Use ROW_NUMBER() OVER(PARTITION BY customer_id ORDER BY updated_at DESC)"], maxScore: 1.5 },
  { id: "q11", section: "MCQ", difficulty: "Medium", type: "single", question: "A LEFT JOIN is returning more rows than expected. What is the most likely reason?", options: ["The right table has duplicate matching keys", "The left table is empty", "SQL always duplicates rows in LEFT JOIN", "BigQuery does not support LEFT JOIN"], correctAnswers: ["The right table has duplicate matching keys"], maxScore: 1.5 },
  { id: "q12", section: "MCQ", difficulty: "Medium", type: "multiple", question: "Which SQL checks are useful before loading data into a downstream system?", options: ["Null checks on required fields", "Duplicate key checks", "Referential integrity checks", "Randomly deleting records", "Row count reconciliation"], correctAnswers: ["Null checks on required fields", "Duplicate key checks", "Referential integrity checks", "Row count reconciliation"], maxScore: 1.5 },
  { id: "q13", section: "MCQ", difficulty: "Medium", type: "single", question: "A table stores 5TB of daily transaction data. The most common query filters by transaction date. What should you do?", options: ["Partition the table by transaction date", "Store all data in a single unpartitioned table", "Use only JSON columns", "Export the table before every query"], correctAnswers: ["Partition the table by transaction date"], maxScore: 1.5 },
  { id: "q14", section: "MCQ", difficulty: "Medium", type: "single", question: "When is clustering most useful?", options: ["When queries frequently filter or group by certain columns", "When the table has only 5 rows", "When no WHERE clause is ever used", "When data is never queried"], correctAnswers: ["When queries frequently filter or group by certain columns"], maxScore: 1.5 },
  { id: "q15", section: "MCQ", difficulty: "Medium", type: "single", question: "In Airflow, a DAG defines:", options: ["A collection of tasks and their dependencies", "A BigQuery table", "A Python package manager", "A Terraform state file"], correctAnswers: ["A collection of tasks and their dependencies"], maxScore: 1.5 },
  { id: "q16", section: "MCQ", difficulty: "Medium", type: "single", question: "Why are retries useful in Airflow?", options: ["They hide permanent bugs", "They help recover from temporary failures like network or API issues", "They make pipelines faster always", "They remove the need for monitoring"], correctAnswers: ["They help recover from temporary failures like network or API issues"], maxScore: 1.5 },
  { id: "q17", section: "MCQ", difficulty: "Tough", type: "multiple", question: "Which are good Airflow practices?", options: ["Keep DAG files lightweight", "Put heavy transformation logic directly inside the DAG definition file", "Make tasks idempotent", "Use retries and alerts", "Track dependencies clearly"], correctAnswers: ["Keep DAG files lightweight", "Make tasks idempotent", "Use retries and alerts", "Track dependencies clearly"], maxScore: 1.5 },
  { id: "q18", section: "MCQ", difficulty: "Medium", type: "single", question: "A pipeline is idempotent when:", options: ["It produces incorrect output if run twice", "It can be safely rerun without creating duplicate or inconsistent output", "It only runs once per year", "It has no logs"], correctAnswers: ["It can be safely rerun without creating duplicate or inconsistent output"], maxScore: 1.5 },
  { id: "q19", section: "MCQ", difficulty: "Medium", type: "single", question: "Terraform is mainly used for:", options: ["Writing SQL queries", "Provisioning and managing infrastructure as code", "Creating dashboards only", "Replacing Python code"], correctAnswers: ["Provisioning and managing infrastructure as code"], maxScore: 1.5 },
  { id: "q20", section: "MCQ", difficulty: "Medium", type: "single", question: "Why is Terraform state important?", options: ["It tracks the mapping between configuration and real infrastructure", "It stores Python packages", "It stores BigQuery query results", "It replaces Git"], correctAnswers: ["It tracks the mapping between configuration and real infrastructure"], maxScore: 1.5 },
  { id: "q21", section: "MCQ", difficulty: "Tough", type: "multiple", question: "Which are good Terraform practices?", options: ["Use remote backend for shared state", "Commit secret keys into .tf files", "Use modules for reusable infrastructure", "Review terraform plan before apply", "Lock state to avoid concurrent changes"], correctAnswers: ["Use remote backend for shared state", "Use modules for reusable infrastructure", "Review terraform plan before apply", "Lock state to avoid concurrent changes"], maxScore: 1.5 },
  { id: "q22", section: "MCQ", difficulty: "Medium", type: "single", question: "Which test would best validate a Python transformation function?", options: ["Unit test with controlled input and expected output", "Manual checking after deployment only", "Restarting the Airflow scheduler", "Deleting output files"], correctAnswers: ["Unit test with controlled input and expected output"], maxScore: 1.5 },
  { id: "q23", section: "MCQ", difficulty: "Medium", type: "single", question: "An integration test for a data pipeline should ideally check:", options: ["Only whether the code imports", "End-to-end flow from source sample to expected target output", "Font size in the dashboard", "Whether the laptop is connected to Wi-Fi"], correctAnswers: ["End-to-end flow from source sample to expected target output"], maxScore: 1.5 },
  { id: "q24", section: "MCQ", difficulty: "Tough", type: "multiple", question: "Which are valid pytest practices?", options: ["Use fixtures for reusable test data/setup", "Assert expected output clearly", "Test only the happy path", "Mock external services where needed", "Keep tests deterministic"], correctAnswers: ["Use fixtures for reusable test data/setup", "Assert expected output clearly", "Mock external services where needed", "Keep tests deterministic"], maxScore: 1.5 },
  { id: "q25", section: "MCQ", difficulty: "Medium", type: "single", question: "An SRE mindset in data engineering means:", options: ["Only writing code and ignoring production", "Monitoring reliability, logs, latency, failures, and recovery", "Avoiding automation", "Waiting for users to report every issue"], correctAnswers: ["Monitoring reliability, logs, latency, failures, and recovery"], maxScore: 1.5 },
  { id: "q26", section: "MCQ", difficulty: "Medium", type: "single", question: "Which metric is most useful for detecting pipeline data issues?", options: ["Row count variance between source and target", "Employee attendance", "Laptop battery level", "UI color theme"], correctAnswers: ["Row count variance between source and target"], maxScore: 1.5 },
  { id: "q27", section: "MCQ", difficulty: "Tough", type: "multiple", question: "An Airflow DAG fails at 2 AM. What should you check first?", options: ["Task logs", "Recent code/config changes", "Source schema changes", "Ignore it until morning", "Upstream system availability"], correctAnswers: ["Task logs", "Recent code/config changes", "Source schema changes", "Upstream system availability"], maxScore: 1.5 },
  { id: "q28", section: "MCQ", difficulty: "Medium", type: "single", question: "Tekton is primarily used for:", options: ["Defining cloud-native CI/CD pipelines", "Writing SQL only", "BI dashboarding", "Manual file transfer"], correctAnswers: ["Defining cloud-native CI/CD pipelines"], maxScore: 1.5 },
  { id: "q29", section: "MCQ", difficulty: "Medium", type: "single", question: "Google Cloud Dataflow is commonly used for:", options: ["Batch and streaming data processing", "Calendar scheduling", "Creating Terraform state files", "Manual spreadsheet editing only"], correctAnswers: ["Batch and streaming data processing"], maxScore: 1.5 },
  { id: "q30", section: "MCQ", difficulty: "Tough", type: "single", question: "You need to move data daily from a source system into BigQuery and downstream applications. Which combination is strongest?", options: ["Python extraction, GCS landing, BigQuery staging, transformation SQL, Airflow orchestration, monitoring/alerts", "Manual CSV upload only", "Copy-paste into PowerPoint", "Store all data in local laptop folders"], correctAnswers: ["Python extraction, GCS landing, BigQuery staging, transformation SQL, Airflow orchestration, monitoring/alerts"], maxScore: 1.5 },
  
  // 10 Debugging Scenarios (Converted to MCQ for auto-grading)
  { id: "q31", section: "DEBUGGING", difficulty: "Medium", type: "single", question: "Python aggregation bug:\nrecords = [{'customer': 'A', 'amount': 100}, {'customer': 'B', 'amount': 200}]\nsummary = {}\nfor r in records:\n    summary[r['customer']] += r['amount']\nWhat is wrong?", options: ["summary[r['customer']] throws KeyError on first access", "The loop syntax is invalid", "amount must be parsed as int", "Dictionaries cannot be updated in a loop"], correctAnswers: ["summary[r['customer']] throws KeyError on first access"], maxScore: 3 },
  { id: "q32", section: "DEBUGGING", difficulty: "Tough", type: "single", question: "Python mutable default argument bug:\ndef add_error(error, errors=[]):\n    errors.append(error)\n    return errors\nWhat is the issue?", options: ["errors list is shared across all function calls", "append() returns None", "error cannot be appended to a list", "SyntaxError in function definition"], correctAnswers: ["errors list is shared across all function calls"], maxScore: 3 },
  { id: "q33", section: "DEBUGGING", difficulty: "Medium", type: "single", question: "Python file handling issue:\nf = open('input.csv', 'r')\ndata = f.read()\nprocess(data)\nf.close()\nWhat should be improved?", options: ["File is not closed if process(data) throws an error", "f.read() reads only one line", "open() defaults to write mode", "data variable is reserved"], correctAnswers: ["File is not closed if process(data) throws an error"], maxScore: 3 },
  { id: "q34", section: "DEBUGGING", difficulty: "Medium", type: "single", question: "SQL duplicate issue:\nSELECT c.customer_id, c.name, o.order_id\nFROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;\nThe result has multiple rows per customer. Why?", options: ["The orders table has multiple rows per customer_id", "LEFT JOIN always duplicates rows", "customer_id is null in customers", "Select statement is missing DISTINCT"], correctAnswers: ["The orders table has multiple rows per customer_id"], maxScore: 3 },
  { id: "q35", section: "DEBUGGING", difficulty: "Tough", type: "single", question: "BigQuery partition filter bug:\nSELECT * FROM project.dataset.transactions WHERE customer_id = 'C123';\nThe table is partitioned by transaction_date. What is the issue?", options: ["The query lacks a filter on the partition column transaction_date", "customer_id cannot be a string", "SELECT * is not allowed in BigQuery", "WHERE clause must come after GROUP BY"], correctAnswers: ["The query lacks a filter on the partition column transaction_date"], maxScore: 3 },
  { id: "q36", section: "DEBUGGING", difficulty: "Tough", type: "single", question: "SQL deduplication bug:\nSELECT DISTINCT customer_id, status, updated_at FROM customer_status;\nThis still returns multiple rows per customer. Why?", options: ["DISTINCT applies to all columns; different status or updated_at keeps duplicates", "DISTINCT only applies to the first column", "It should be UNIQUE instead of DISTINCT", "updated_at is not a valid column name"], correctAnswers: ["DISTINCT applies to all columns; different status or updated_at keeps duplicates"], maxScore: 3 },
  { id: "q37", section: "DEBUGGING", difficulty: "Tough", type: "single", question: "Airflow DAG parse issue:\nfrom airflow import DAG\nimport pandas as pd\ndf = pd.read_csv('large_file.csv')\nWhat is wrong?", options: ["Heavy file processing happens at DAG parse time, blocking the scheduler", "pandas cannot be imported in Airflow", "DAG is missing a schedule_interval", "The file should be a JSON"], correctAnswers: ["Heavy file processing happens at DAG parse time, blocking the scheduler"], maxScore: 3 },
  { id: "q38", section: "DEBUGGING", difficulty: "Tough", type: "single", question: "Airflow non-idempotent task:\ndef load_to_target(rows):\n    for row in rows: insert_into_target(row)\nThe task is retried after failure and creates duplicates. Issue?", options: ["Retries will insert duplicate rows because the logic is not idempotent", "The loop is too slow", "insert_into_target is not defined", "Task will fail because rows is an iterator"], correctAnswers: ["Retries will insert duplicate rows because the logic is not idempotent"], maxScore: 3 },
  { id: "q39", section: "DEBUGGING", difficulty: "Tough", type: "single", question: "Terraform hardcoded secret:\nvariable 'db_password' { default = 'Password@123' }\nWhat is wrong?", options: ["The secret is stored in plaintext in the state file and source code", "Variables cannot have default values", "google_service_account_key is deprecated", "Password@123 is too weak"], correctAnswers: ["The secret is stored in plaintext in the state file and source code"], maxScore: 3 },
  { id: "q40", section: "DEBUGGING", difficulty: "Tough", type: "single", question: "Python schema validation bug:\ndef transform(row): return {'id': row['id'], 'amount': float(row['amount'])}\nThis fails when amount is blank. How do you fix it?", options: ["float('') throws ValueError if amount is blank", "row['id'] is missing", "Dict cannot be returned", "The function requires a return type hint"], correctAnswers: ["float('') throws ValueError if amount is blank"], maxScore: 3 },
];

// --- TYPES ---
type CandidateData = { fullName: string; email: string; phone: string; experience: string; company: string; };
type Answer = { qId: string; selectedOptions: string[]; timeTaken: number; autoSubmitted: boolean; score: number; skipped?: boolean };
type Violation = { type: string; timestamp: number; penalty: number; qId: string; };
type Submission = { 
  id: string; 
  candidate: CandidateData; 
  violationsCount: number; 
  score: number; 
  metrics: { totalTime: number; mcq: number; debug: number; status: string; }; 
  timestamp: number;
};

// --- UTILS ---
const getTodayPassword = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}${month}${year}`;
};

const calculateScore = (q: Question, a: Answer) => {
  if (q.type === 'single') return q.correctAnswers?.[0] === a.selectedOptions[0] ? q.maxScore : 0;
  if (q.type === 'multiple') {
    const correct = q.correctAnswers || [];
    const selected = a.selectedOptions;
    const allCorrectSelected = correct.every(c => selected.includes(c));
    const noWrongSelected = selected.every(s => correct.includes(s));
    if (allCorrectSelected && noWrongSelected) return q.maxScore;
    if (noWrongSelected && selected.length > 0) return q.maxScore * 0.5;
    return 0;
  }
  return 0;
};

const determineStatus = (score: number) => {
  if (score >= 48) return 'Strong'; // 80% of 60
  if (score >= 36) return 'Consider'; // 60% of 60
  return 'Weak';
};

// --- COMPONENTS ---
const BackgroundOrbs = () => (
  <>
    <div className="bg-orb orb-1"></div>
    <div className="bg-orb orb-2"></div>
    <div className="bg-orb orb-3"></div>
  </>
);

const Header = () => (
  <header className="border-b border-[#222] bg-[#000] sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-bold text-xs">
          DE
        </div>
        <span className="font-medium text-xs tracking-widest text-white uppercase">
          Technical Assessment
        </span>
      </div>
      <div className="text-[10px] font-medium tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        Intelligence. Decoded.
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="w-full bg-[#000] border-t border-[#111] py-6 z-20 mt-auto">
    <div className="max-w-7xl mx-auto px-6 text-center text-[10px] text-gray-600 uppercase tracking-widest font-medium flex flex-col sm:flex-row justify-between items-center gap-4">
      <span>Secure Evaluation Environment</span>
      <span>Intelligence Decoded &copy; {new Date().getFullYear()}</span>
    </div>
  </footer>
);

// --- VIEWS ---
const PasskeyView = ({ onValidPasskey, onAdminLogin }: any) => {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  const handleStart = () => {
    if (pwd !== getTodayPassword()) { setErr("Invalid or expired passkey."); return; }
    onValidPasskey();
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="minimal-card w-full max-w-sm p-8 rounded-sm hover:border-[#444]">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center bg-[#050505]">
            <KeyRound size={20} className="text-white" />
          </div>
        </div>
        <h1 className="text-lg font-medium mb-1 text-white tracking-tight uppercase text-center">System Authentication</h1>
        <p className="text-gray-500 mb-8 font-light text-[10px] tracking-widest uppercase text-center">Enter your assigned passkey</p>
        <div className="space-y-4">
          <input 
            type="password" placeholder="Passkey (DDMMYYYY)" 
            className="minimal-input w-full rounded p-3 text-xs text-white tracking-widest text-center focus:outline-none" 
            value={pwd} onChange={e => { setPwd(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
          {err && <div className="text-red-400 text-[10px] tracking-widest uppercase bg-red-950/20 p-2 rounded border border-red-900/50 flex items-center justify-center gap-2"><AlertTriangle size={12}/>{err}</div>}
          <button 
            onClick={handleStart} 
            className="w-full bg-white text-black font-semibold text-[10px] uppercase tracking-[0.2em] p-3.5 rounded mt-2 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
          >
            Authenticate <ChevronRight size={14} />
          </button>
          <div className="text-center mt-6">
            <button onClick={onAdminLogin} className="text-[9px] font-medium text-gray-600 hover:text-white transition-colors uppercase tracking-widest">Administrator Access</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoView = ({ candidate, setCandidate, onComplete }: any) => {
  const [err, setErr] = useState('');

  const handleNext = () => {
    if (!candidate.fullName || !candidate.email) { setErr("Identity fields are required."); return; }
    onComplete();
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="minimal-card w-full max-w-md p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-[#222] pb-4">
          <User size={18} className="text-gray-400" />
          <h1 className="text-sm font-medium text-white tracking-widest uppercase">Candidate Identity</h1>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5 group">
            <label className="text-[9px] font-medium text-gray-500 uppercase tracking-widest transition-colors group-focus-within:text-white">Full Name *</label>
            <input type="text" className="minimal-input w-full rounded p-3 text-xs text-white outline-none" placeholder="John Doe" value={candidate.fullName} onChange={e => {setCandidate({...candidate, fullName: e.target.value}); setErr('');}} />
          </div>
          <div className="space-y-1.5 group">
            <label className="text-[9px] font-medium text-gray-500 uppercase tracking-widest transition-colors group-focus-within:text-white">Email Address *</label>
            <input type="email" className="minimal-input w-full rounded p-3 text-xs text-white outline-none" placeholder="john@domain.com" value={candidate.email} onChange={e => {setCandidate({...candidate, email: e.target.value}); setErr('');}} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 group">
              <label className="text-[9px] font-medium text-gray-500 uppercase tracking-widest transition-colors group-focus-within:text-white">Experience (Yrs)</label>
              <input type="number" className="minimal-input w-full rounded p-3 text-xs text-white outline-none" placeholder="0" value={candidate.experience} onChange={e => setCandidate({...candidate, experience: e.target.value})} />
            </div>
            <div className="space-y-1.5 group">
              <label className="text-[9px] font-medium text-gray-500 uppercase tracking-widest transition-colors group-focus-within:text-white">Current Company</label>
              <input type="text" className="minimal-input w-full rounded p-3 text-xs text-white outline-none" placeholder="Optional" value={candidate.company} onChange={e => setCandidate({...candidate, company: e.target.value})} />
            </div>
          </div>
          {err && <div className="text-red-400 text-[10px] tracking-widest uppercase bg-red-950/20 p-2 rounded border border-red-900/50 flex items-center justify-center gap-2"><AlertTriangle size={12}/>{err}</div>}
          <button 
            onClick={handleNext} 
            className="w-full bg-white text-black font-semibold text-[10px] uppercase tracking-[0.2em] p-3.5 rounded mt-4 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
          >
            Proceed <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const InstructionsView = ({ onStartTest }: any) => {
  const [checks, setChecks] = useState([false, false, false, false]);
  const allChecked = checks.every(Boolean);
  const toggleCheck = (index: number) => { const newChecks = [...checks]; newChecks[index] = !newChecks[index]; setChecks(newChecks); };

  const INSTRUCTIONS = [
    { id: '01', title: 'Structure', text: 'You will receive 30 shuffled MCQs and 5 shuffled debug scenarios.', isCritical: false },
    { id: '02', title: 'Timing', text: 'You have exactly 59 seconds per question. If the timer runs out, the question will auto-submit.', isCritical: false },
    { id: '03', title: 'No Backtracking', text: 'Once you submit an answer or time expires, you cannot return to previous questions.', isCritical: false },
    { id: '04', title: 'Strict Monitoring', text: 'Tab switching, minimizing the window, or losing focus will trigger an immediate 30-second penalty per violation. Repeated offenses will flag your submission.', isCritical: true },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-6 animate-fade-in-up w-full h-full">
      <div className="minimal-card w-full max-w-3xl p-10 md:p-12 rounded-sm flex flex-col max-h-[85vh]">
        <div className="flex items-center gap-3 mb-8 border-b border-[#222] pb-6 shrink-0">
          <BookOpen size={20} className="text-gray-400" />
          <h1 className="text-base font-medium text-white tracking-widest uppercase">Evaluation Protocol</h1>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-gray-300 font-light mb-8">
          <p className="mb-6 text-sm text-gray-400">Welcome to the Data Engineering technical evaluation. Please read and acknowledge the following instructions carefully before proceeding:</p>
          <div className="space-y-4">
            {INSTRUCTIONS.map((inst, idx) => (
              <div 
                key={inst.id} onClick={() => toggleCheck(idx)}
                className={`flex items-start gap-5 p-5 rounded-sm border cursor-pointer transition-all duration-300 hover:bg-[#050505] ${checks[idx] ? 'border-white/40 bg-[#0a0a0a]' : 'border-[#222] bg-transparent hover:border-[#444]'}`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded-sm border transition-all duration-300 ${checks[idx] ? 'bg-white border-white text-black' : 'border-[#444]'}`}>
                  {checks[idx] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <div className="flex-1 leading-relaxed">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`font-mono text-[10px] ${inst.isCritical ? 'text-red-400' : 'text-gray-500'}`}>{inst.id}.</span>
                    <strong className={`font-medium tracking-widest uppercase text-[11px] ${inst.isCritical ? 'text-red-400' : 'text-white'}`}>{inst.title}</strong>
                  </div>
                  <span className={inst.isCritical ? 'text-gray-400' : 'text-gray-400'}>{inst.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-[#222] mt-auto shrink-0">
          <button 
            disabled={!allChecked}
            onClick={() => {
              onStartTest();
              try { document.documentElement.requestFullscreen().catch(() => {}); } catch(e) {}
            }} 
            className={`w-full font-semibold text-[10px] uppercase tracking-[0.2em] p-4 rounded flex items-center justify-center gap-2 transition-all duration-300 ${allChecked ? 'bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98] cursor-pointer' : 'bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed opacity-70'}`}
          >
            {allChecked ? 'I Understand, Begin Evaluation' : 'Acknowledge All Protocols to Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TestView = ({ 
  activeQuestions, qIndex, timeLeft, currentSelection, setCurrentSelection, handleNext, showViolationModal, isNotesOpen, setIsNotesOpen, notes, setNotes, isSubmitting 
}: any) => {
  const q = activeQuestions[qIndex];
  if (!q) return null;

  const isTimeLow = timeLeft <= 10;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 59) * circumference;

  return (
    <div className="flex-1 flex flex-col user-select-none relative overflow-hidden bg-black z-10 w-full h-full">
      <style dangerouslySetInnerHTML={{__html: `* { user-select: none; } textarea { user-select: auto; }`}} />
      <div className="bg-[#050505] border-b border-[#222] px-6 py-4 sticky top-0 z-30 transition-all">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-[10px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-1 flex items-center gap-2">
              <Zap size={10} className="text-white"/> {q.section} • {q.difficulty}
            </div>
            <div className="text-base font-medium text-white tracking-tight">Question {qIndex + 1} <span className="text-gray-600 text-sm">/ {activeQuestions.length}</span></div>
          </div>
          <div className={`relative flex items-center justify-center w-12 h-12 ${isTimeLow ? 'timer-critical animate-pulse' : ''}`}>
            <svg width="48" height="48" viewBox="0 0 48 48" className="absolute -rotate-90">
              <circle cx="24" cy="24" r={radius} stroke="#222" strokeWidth="2" fill="none" />
              <circle cx="24" cy="24" r={radius} stroke={isTimeLow ? "#ef4444" : "#ffffff"} strokeWidth="2" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }} />
            </svg>
            <div className={`text-xs font-mono font-medium z-10 ${isTimeLow ? 'text-red-400' : 'text-white'}`}>{timeLeft}</div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-4 h-[2px] bg-[#222] overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-white transition-all duration-500 ease-out" style={{ width: `${((qIndex) / activeQuestions.length) * 100}%` }}></div>
        </div>
      </div>

      <div key={qIndex} className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col mt-4 animate-fade-in-up">
        <div className="minimal-card p-8 rounded-sm flex-1 mb-6">
          <h3 className="text-sm text-white font-normal leading-relaxed whitespace-pre-wrap mb-8 tracking-wide">{q.question}</h3>
          <div className="space-y-3">
            {q.options?.map((opt: string, i: number) => {
              const isSelected = currentSelection.includes(opt);
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    if (q.type === 'single') setCurrentSelection([opt]);
                    else setCurrentSelection((prev: string[]) => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
                  }}
                  className={`p-4 rounded-sm border cursor-pointer transition-all duration-300 flex items-center gap-4 group slide-in-right ${isSelected ? 'bg-[#111] border-white text-white scale-[1.01]' : 'bg-transparent border-[#222] hover:border-[#555] hover:bg-[#050505]'}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={`w-4 h-4 flex items-center justify-center rounded-sm border transition-all duration-300 ${isSelected ? 'border-white bg-white' : 'border-[#444] group-hover:border-[#888]'}`}>
                    {isSelected && <div className={`bg-black w-2 h-2 rounded-[1px]`} />}
                  </div>
                  <span className="text-xs tracking-wide text-gray-300 group-hover:text-white transition-colors">{opt}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="text-[10px] font-medium text-gray-600 flex items-center gap-2 tracking-widest uppercase">
            <ShieldAlert size={12} className="text-white"/> Security protocols active
          </div>
          <div className="flex items-center gap-4">
            <button 
              disabled={isSubmitting}
              onClick={() => handleNext(false, true)}
              className="bg-transparent text-gray-400 px-6 py-3 rounded-sm font-semibold text-[10px] tracking-widest uppercase transition-all duration-300 hover:text-white border border-[#333] hover:border-white active:scale-[0.98] flex items-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Skip <FastForward size={12} />
            </button>
            <button 
              disabled={currentSelection.length === 0 || isSubmitting}
              onClick={() => handleNext(false, false)}
              className="bg-white text-black px-8 py-3 rounded-sm font-semibold text-[10px] tracking-widest uppercase transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-[0.98]"
            >
              {isSubmitting ? 'Transmitting...' : (qIndex === activeQuestions.length - 1 ? 'Finalize' : 'Acknowledge')}
            </button>
          </div>
        </div>
      </div>

      <button onClick={() => setIsNotesOpen(!isNotesOpen)} className="fixed bottom-6 right-6 bg-white text-black p-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] z-40 hover:bg-gray-200 transition-transform duration-300 hover:scale-110 active:scale-95" title="Open Scratchpad">
        {isNotesOpen ? <X size={18} /> : <PenTool size={18} />}
      </button>

      <div className={`fixed top-0 right-0 h-full w-80 bg-[#0a0a0a] border-l border-[#222] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-50 flex flex-col ${isNotesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#050505]">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2"><PenTool size={12}/> Scratchpad</h4>
          <button onClick={() => setIsNotesOpen(false)} className="text-gray-500 hover:text-white transition-transform hover:rotate-90"><X size={14}/></button>
        </div>
        <textarea className="flex-1 w-full bg-transparent border-none outline-none text-xs text-gray-300 p-4 resize-none font-mono leading-relaxed focus:ring-0" placeholder="Use this space for temporary notes or query drafting. Content here is NOT graded." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {showViolationModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center animate-fade-in-up">
          <div className="minimal-card border-[#333] p-10 rounded-sm max-w-sm text-center border-t-2 border-t-red-500">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-lg font-medium text-white mb-2 tracking-tight uppercase">Focus Lost</h2>
            <p className="text-gray-400 text-[11px] mb-6 leading-relaxed">Tab switching or window blurring detected. A 30-second penalty has been applied to your timer.</p>
            <div className="text-[9px] font-semibold text-red-400 tracking-[0.2em] uppercase">Further violations will terminate session</div>
          </div>
        </div>
      )}
    </div>
  );
};

const ResultView = ({ answers, candidate, violations, activeQuestions }: any) => {
  const totalScore = answers.reduce((acc: number, a: any) => acc + a.score, 0);
  const totalPossibleScore = activeQuestions.reduce((acc: number, q: any) => acc + q.maxScore, 0); 
  const status = determineStatus(totalScore);

  return (
    <div className="flex-1 p-6 max-w-4xl w-full mx-auto flex flex-col justify-center animate-fade-in-up">
      <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="inline-block p-3 border border-[#333] rounded-sm mb-4 bg-[#0a0a0a]">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-medium text-white mb-2 tracking-tight uppercase">Sequence Complete</h1>
        <p className="text-gray-500 text-xs font-light tracking-wide">Data has been securely transmitted, {candidate.fullName}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="minimal-card p-6 rounded-sm text-center group transition-transform duration-300 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="text-[10px] font-medium text-gray-600 tracking-widest uppercase mb-3 group-hover:text-gray-400 transition-colors">Final Assessment</div>
          <div className={`text-2xl font-semibold tracking-tight ${status === 'Strong' ? 'text-white' : status === 'Consider' ? 'text-gray-400' : 'text-gray-600'}`}>{status}</div>
          <div className="text-[9px] text-gray-600 mt-3 tracking-widest uppercase">Fully Auto-Graded</div>
        </div>
        <div className="minimal-card p-6 rounded-sm text-center group transition-transform duration-300 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="text-[10px] font-medium text-gray-600 tracking-widest uppercase mb-3 group-hover:text-gray-400 transition-colors">Total Score</div>
          <div className="text-2xl font-semibold text-white tracking-tight">{totalScore} <span className="text-lg text-gray-600 font-normal">/ {totalPossibleScore}</span></div>
        </div>
        <div className="minimal-card p-6 rounded-sm text-center group transition-transform duration-300 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="text-[10px] font-medium text-gray-600 tracking-widest uppercase mb-3 group-hover:text-gray-400 transition-colors">Security Flags</div>
          <div className={`text-2xl font-semibold tracking-tight ${violations.length > 0 ? 'text-white' : 'text-gray-600'}`}>{violations.length}</div>
        </div>
      </div>

      <div className="minimal-card p-8 rounded-sm animate-fade-in-up hover:border-[#444] transition-colors" style={{animationDelay: '0.5s'}}>
        <h3 className="text-[10px] font-medium text-gray-500 tracking-widest uppercase mb-6">Telemetry Overview</h3>
        <div className="space-y-2 text-xs text-gray-300 font-medium tracking-wide">
          {['Python & Data Structures', 'SQL & BigQuery Optimization', 'Airflow & Orchestration', 'Debug Scenarios'].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-[#050505] border border-[#222] rounded-sm hover:border-[#555] hover:bg-[#0a0a0a] transition-all slide-in-right" style={{animationDelay: `${idx * 0.1 + 0.6}s`}}>
              <span>{item}</span>
              <span className="text-white flex items-center gap-2"><CheckCircle2 size={12}/> Evaluated</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin }: any) => {
  const [pwd, setPwd] = useState('');
  return (
    <div className="flex-1 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="minimal-card p-8 rounded-sm w-full max-w-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#555]"></div>
        <h2 className="text-sm font-medium text-white mb-6 flex items-center gap-2 tracking-widest uppercase"><Lock size={16}/> Restricted Area</h2>
        <input 
          type="password" placeholder="Admin Passkey" 
          className="minimal-input w-full rounded p-3 text-xs mb-6 outline-none text-white tracking-widest text-center" 
          value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && (pwd === 'Pikashoot123!' ? onLogin() : alert("Access Denied"))}
        />
        <button 
          onClick={() => { if(pwd === 'Pikashoot123!') onLogin(); else alert("Access Denied"); }}
          className="w-full bg-white text-black p-3.5 rounded text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >Authenticate</button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ QUESTIONS, onLogout }: any) => {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get('submissions', 'select=*,candidates(*)');
        if (!data) return;

        const formatted = data.map((d: any) => ({
          id: d.id,
          candidate: { fullName: d.candidates.full_name, email: d.candidates.email, phone: d.candidates.phone || '', experience: d.candidates.experience_years || '0', company: d.candidates.current_company || '' },
          violationsCount: d.total_violations || 0,
          metrics: { totalTime: d.total_time_taken_seconds, mcq: d.mcq_score, debug: d.debugging_score, status: d.status },
          timestamp: new Date(d.created_at).getTime(),
        }));
        setSubs(formatted.sort((a: any, b: any) => b.timestamp - a.timestamp));
      } catch(e) { console.error(e); }
    };
    fetchData();
  }, []);

  if (selectedSub) {
    return (
      <div className="flex-1 p-6 w-full max-w-6xl mx-auto z-50 relative animate-fade-in-up">
        <button onClick={() => setSelectedSub(null)} className="mb-6 text-[10px] font-medium tracking-widest uppercase text-gray-500 hover:text-white flex items-center gap-2 transition-transform hover:-translate-x-1">
          <ChevronRight className="rotate-180" size={14}/> Return
        </button>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 minimal-card p-6 rounded-sm">
            <h2 className="text-xl font-medium text-white mb-4 tracking-tight">{selectedSub.candidate.fullName}</h2>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 font-light">
              <div className="flex items-center gap-2"><Mail size={14} className="text-gray-600"/>{selectedSub.candidate.email}</div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-gray-600"/>{selectedSub.candidate.phone}</div>
              <div className="flex items-center gap-2"><Briefcase size={14} className="text-gray-600"/>{selectedSub.candidate.company} ({selectedSub.candidate.experience}y)</div>
              <div className="flex items-center gap-2"><Clock size={14} className="text-gray-600"/>{Math.floor(selectedSub.metrics.totalTime / 60)}m {selectedSub.metrics.totalTime % 60}s</div>
            </div>
          </div>
          <div className="minimal-card p-6 rounded-sm flex flex-col justify-center items-center text-center">
            <div className="text-3xl font-medium text-white mb-2 tracking-tighter">{selectedSub.metrics.mcq + selectedSub.metrics.debug} <span className="text-base text-gray-600 font-normal">/ 60</span></div>
            <div className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm border ${selectedSub.metrics.status === 'Strong' ? 'bg-[#111] text-white border-[#333]' : selectedSub.metrics.status === 'Consider' ? 'bg-transparent text-gray-400 border-[#222]' : 'bg-transparent text-gray-600 border-[#111]'}`}>
              {selectedSub.metrics.status} Status
            </div>
            {selectedSub.violationsCount > 0 && <div className="mt-4 text-[9px] font-medium text-white tracking-widest uppercase flex items-center gap-2"><ShieldAlert size={10}/> {selectedSub.violationsCount} Flags</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-6xl w-full mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-lg font-medium text-white tracking-widest uppercase">Intelligence Oversight</h1>
        <button onClick={onLogout} className="text-[10px] font-medium tracking-widest uppercase text-gray-600 hover:text-white flex items-center gap-2 transition-transform hover:scale-105"><LogOut size={14}/> Terminate</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="minimal-card p-5 rounded-sm group hover:-translate-y-1 transition-transform" style={{animationDelay: '0s'}}>
          <div className="text-gray-600 text-[9px] font-medium uppercase tracking-widest mb-1 group-hover:text-gray-400 transition-colors">Total Records</div>
          <div className="text-2xl font-medium text-white">{subs.length}</div>
        </div>
        <div className="minimal-card p-5 rounded-sm group hover:-translate-y-1 transition-transform" style={{animationDelay: '0.1s'}}>
          <div className="text-gray-600 text-[9px] font-medium uppercase tracking-widest mb-1 group-hover:text-gray-400 transition-colors">Mean Score</div>
          <div className="text-2xl font-medium text-white">{subs.length ? (subs.reduce((acc, s) => acc + s.metrics.mcq + s.metrics.debug, 0) / subs.length).toFixed(1) : 0}</div>
        </div>
        <div className="minimal-card p-5 rounded-sm group hover:-translate-y-1 transition-transform" style={{animationDelay: '0.2s'}}>
          <div className="text-gray-600 text-[9px] font-medium uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Verified Strong</div>
          <div className="text-2xl font-medium text-white">{subs.filter(s => s.metrics.status === 'Strong').length}</div>
        </div>
        <div className="minimal-card p-5 rounded-sm group hover:-translate-y-1 transition-transform" style={{animationDelay: '0.3s'}}>
          <div className="text-gray-600 text-[9px] font-medium uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Flagged</div>
          <div className="text-2xl font-medium text-gray-400">{subs.filter(s => s.violationsCount > 2).length}</div>
        </div>
      </div>
      <div className="minimal-card rounded-sm overflow-hidden" style={{animationDelay: '0.4s'}}>
        <table className="w-full text-left text-xs text-gray-400">
          <thead className="bg-[#050505] text-[9px] font-medium uppercase tracking-widest text-gray-600 border-b border-[#222]">
            <tr>
              <th className="p-4">Identity</th>
              <th className="p-4">Exp</th>
              <th className="p-4">Class</th>
              <th className="p-4">Score</th>
              <th className="p-4">Flags</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111]">
            {subs.map(s => (
              <tr key={s.id} className="hover:bg-[#050505] transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-gray-200 tracking-wide group-hover:text-white transition-colors">{s.candidate.fullName}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{s.candidate.email}</div>
                </td>
                <td className="p-4 font-mono text-gray-500">{s.candidate.experience}y</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-sm text-[9px] font-medium tracking-widest uppercase border ${s.metrics.status === 'Strong' ? 'text-white border-[#444] bg-[#111]' : s.metrics.status === 'Consider' ? 'text-gray-400 border-[#222]' : 'text-gray-600 border-[#111]'}`}>
                    {s.metrics.status}
                  </span>
                </td>
                <td className="p-4 font-mono text-white">{s.metrics.mcq + s.metrics.debug}</td>
                <td className="p-4"><span className={`font-medium ${s.violationsCount > 0 ? 'text-white' : 'text-gray-700'}`}>{s.violationsCount}</span></td>
                <td className="p-4 text-[10px] font-mono text-gray-600">{new Date(s.timestamp).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setSelectedSub(s)} className="text-[9px] font-medium tracking-widest uppercase text-black bg-white hover:bg-gray-300 px-3 py-1.5 rounded-sm transition-transform hover:scale-105 active:scale-95">Audit</button>
                </td>
              </tr>
            ))}
            {subs.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-600 tracking-widest uppercase text-[10px] font-medium">No data streams detected.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'gate-passkey' | 'gate-info' | 'instructions' | 'test' | 'result' | 'adminLogin' | 'adminDashboard'>('gate-passkey');
  const [candidate, setCandidate] = useState<CandidateData>({ fullName: '', email: '', phone: '', experience: '', company: '' });
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(59);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [notes, setNotes] = useState('');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  
  // Submit lock states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (view !== 'test') return;
    const handleVisibility = () => { if (document.hidden) triggerViolation('Tab Switch'); };
    const handleBlur = () => triggerViolation('Window Blur');
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [view, qIndex]);

  useEffect(() => {
    if (view === 'test' && timeLeft > 0 && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { handleNext(true); return 59; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view, timeLeft, qIndex, isSubmitting]);

  const generateQuestionSet = () => {
    const mcqs = QUESTIONS.filter(q => q.section === 'MCQ').sort(() => 0.5 - Math.random()).slice(0, 30);
    const debugs = QUESTIONS.filter(q => q.section === 'DEBUGGING').sort(() => 0.5 - Math.random()).slice(0, 5);
    setActiveQuestions([...mcqs, ...debugs]);
  };

  const triggerViolation = (type: string) => {
    if (!activeQuestions[qIndex] || isSubmittingRef.current) return;
    setViolations(prev => [...prev, { type, timestamp: Date.now(), penalty: 30, qId: activeQuestions[qIndex].id }]);
    setShowViolationModal(true);
    setTimeLeft(prev => Math.max(0, prev - 30));
    setTimeout(() => setShowViolationModal(false), 3000);
  };

  const handleNext = async (autoSubmitted = false, skipped = false) => {
    if (isSubmittingRef.current) return; // Prevent duplicate executions
    if (timerRef.current) clearInterval(timerRef.current);
    
    const q = activeQuestions[qIndex];
    const answerData: Answer = {
      qId: q.id,
      selectedOptions: skipped ? [] : currentSelection,
      timeTaken: 59 - timeLeft,
      autoSubmitted,
      skipped,
      score: 0 
    };
    answerData.score = skipped ? 0 : calculateScore(q, answerData);

    const newAnswers = [...answers, answerData];
    setAnswers(newAnswers);
    setCurrentSelection([]);

    if (qIndex < activeQuestions.length - 1) {
      setQIndex(qIndex + 1);
      setTimeLeft(59);
    } else {
      // Lock the form and execute final submission
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      await submitTest(newAnswers);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const submitTest = async (finalAnswers: Answer[]) => {
    let mcq = 0, debug = 0, autoSubs = 0;
    finalAnswers.forEach(a => {
      const q = activeQuestions.find(x => x.id === a.qId);
      if (q?.section === 'MCQ') mcq += a.score;
      if (q?.section === 'DEBUGGING') debug += a.score;
      if (a.autoSubmitted && !a.skipped) autoSubs++;
    });

    const totalScore = mcq + debug;

    try {
      const candidatePayload = {
        full_name: candidate.fullName, email: candidate.email, phone: candidate.phone, 
        experience_years: candidate.experience ? Number(candidate.experience) : null, current_company: candidate.company || null
      };

      let candidateId;
      const existingCand = await api.get('candidates', `email=eq.${encodeURIComponent(candidate.email)}&select=id`);
      if (existingCand && existingCand.length > 0) {
        candidateId = existingCand[0].id;
        await api.patch('candidates', `id=eq.${candidateId}`, candidatePayload);
      } else {
        const newCand = await api.post('candidates', candidatePayload);
        candidateId = newCand[0].id;
      }

      const submissionPayload = {
        candidate_id: candidateId,
        started_at: new Date(Date.now() - finalAnswers.reduce((a,b)=>a+b.timeTaken,0)*1000).toISOString(),
        completed_at: new Date().toISOString(),
        total_score: totalScore, max_score: 60, percentage: (totalScore / 60) * 100, status: determineStatus(totalScore),
        mcq_score: mcq, debugging_score: debug, total_violations: violations.length,
        total_time_taken_seconds: finalAnswers.reduce((acc, a) => acc + a.timeTaken, 0), auto_submitted_count: autoSubs, manual_review_required: false
      };

      const existingSub = await api.get('submissions', `candidate_id=eq.${candidateId}&select=id`);
      if (existingSub && existingSub.length > 0) {
        await api.patch('submissions', `id=eq.${existingSub[0].id}`, submissionPayload);
      } else {
        await api.post('submissions', submissionPayload);
      }

      setView('result');
    } catch (e) {
      console.error("Submit error", e);
      alert("Failed to submit telemetry to Supabase. Check console logs for details.");
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col font-sans text-white w-full">
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <BackgroundOrbs />
      {view !== 'test' && <Header />}
      <main className="flex-1 flex flex-col relative z-10 w-full">
        {view === 'gate-passkey' && <PasskeyView onValidPasskey={() => setView('gate-info')} onAdminLogin={() => setView('adminLogin')} />}
        {view === 'gate-info' && <InfoView candidate={candidate} setCandidate={setCandidate} onComplete={() => setView('instructions')} />}
        {view === 'instructions' && <InstructionsView onStartTest={() => { generateQuestionSet(); setView('test'); }} />}
        {view === 'test' && activeQuestions.length > 0 && <TestView activeQuestions={activeQuestions} qIndex={qIndex} timeLeft={timeLeft} currentSelection={currentSelection} setCurrentSelection={setCurrentSelection} handleNext={handleNext} showViolationModal={showViolationModal} isNotesOpen={isNotesOpen} setIsNotesOpen={setIsNotesOpen} notes={notes} setNotes={setNotes} isSubmitting={isSubmitting} />}
        {view === 'result' && <ResultView answers={answers} candidate={candidate} violations={violations} activeQuestions={activeQuestions} />}
        {view === 'adminLogin' && <AdminLogin onLogin={() => { setAdminAuth(true); setView('adminDashboard'); }} />}
        {view === 'adminDashboard' && adminAuth && <AdminDashboard QUESTIONS={QUESTIONS} onLogout={() => { setAdminAuth(false); setView('gate-passkey'); }} />}
      </main>
      {view !== 'test' && <Footer />}
    </div>
  );
}
