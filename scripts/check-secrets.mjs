import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const output = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: root, encoding: "utf8" },
);

const files = output.split("\0").filter(Boolean);
const fragments = (...parts) => parts.join("");
const patterns = [
  {
    label: "OpenAI-style secret key",
    expression: new RegExp(`${fragments("s", "k", "-")}(?:proj-)?[A-Za-z0-9_-]{20,}`, "g"),
  },
  {
    label: "GitHub personal access token",
    expression: new RegExp(`${fragments("g", "h", "p", "_")}[A-Za-z0-9]{30,}`, "g"),
  },
  {
    label: "GitHub fine-grained token",
    expression: new RegExp(`${fragments("github", "_pat", "_")}[A-Za-z0-9_]{30,}`, "g"),
  },
  {
    label: "private key block",
    expression: new RegExp(fragments("-----BEGIN ", "(?:RSA |EC |OPENSSH )?PRIVATE KEY-----"), "g"),
  },
  {
    label: "long bearer token",
    expression: /Bearer\s+[A-Za-z0-9._~-]{32,}/gi,
  },
];

const secretAssignment = /\b([A-Z][A-Z0-9_]*(?:_API_KEY|_SECRET|_TOKEN)|API_KEY|ACCESS_TOKEN|AUTH_TOKEN|CLIENT_SECRET|PRIVATE_KEY|SECRET_KEY)\s*[:=]\s*["']?([^\s"',;]+)/gi;
const sitesAuthorization = /OAI-Sites-Authorization\s*[:=]\s*(?:Bearer\s+)?[A-Za-z0-9._~-]{32,}/gi;
const placeholders = /^(?:example|placeholder|changeme|your[-_]|dummy|test(?:ing)?|unset|not[-_]?set|<[^>]+>)/i;
const sensitiveName = /(?:^|\/)(?:id_rsa|id_ed25519|credentials|service-account)(?:\.|$)/i;
const findings = [];

for (const file of files) {
  if (sensitiveName.test(file) && !file.endsWith(".example")) {
    findings.push(`${file}: sensitive credential filename`);
  }

  const buffer = readFileSync(new URL(file, root));
  if (buffer.includes(0)) continue;
  const content = buffer.toString("utf8");

  for (const { label, expression } of patterns) {
    expression.lastIndex = 0;
    if (expression.test(content)) findings.push(`${file}: ${label}`);
  }

  sitesAuthorization.lastIndex = 0;
  if (sitesAuthorization.test(content)) {
    findings.push(`${file}: Sites authorization token`);
  }

  secretAssignment.lastIndex = 0;
  for (const match of content.matchAll(secretAssignment)) {
    if (!placeholders.test(match[2])) {
      findings.push(`${file}: non-placeholder ${match[1]} assignment`);
    }
  }
}

if (findings.length > 0) {
  console.error("Potential secrets found; push blocked:\n");
  for (const finding of [...new Set(findings)]) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Secret scan passed (${files.length} repository files checked).`);
