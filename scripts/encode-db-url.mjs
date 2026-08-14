/**
 * Percent encodes the password inside a Postgres connection string.
 *
 * Supabase hands you a URL with the password dropped in raw. If that password contains
 * any of @ ? & + # / : or %, the URL is then malformed, and the failure is misleading:
 * an unescaped @ makes the parser treat the rest of the password as the hostname, so
 * you get "host not found" and go looking in entirely the wrong place.
 *
 * Run it locally so the password never travels anywhere:
 *
 *   node scripts/encode-db-url.mjs "postgresql://postgres.abc:p@ss?w0rd@host:6543/postgres"
 *
 * It prints the encoded URL, ready to paste into .env.
 */

const input = process.argv[2];

if (!input) {
  console.error('Usage: node scripts/encode-db-url.mjs "<connection string>"');
  process.exit(1);
}

const match = /^(\w+:\/\/)(.*)$/.exec(input.trim());

if (!match) {
  console.error('That does not look like a connection string. It should start with postgresql://');
  process.exit(1);
}

const [, scheme, rest] = match;

/*
 * Split on the LAST @, not the first. The password may legitimately contain one, and
 * the host always sits after the final @, so this is the only split that is safe.
 */
const lastAt = rest.lastIndexOf('@');

if (lastAt === -1) {
  console.error('No credentials found in that string.');
  process.exit(1);
}

const credentials = rest.slice(0, lastAt);
const hostAndPath = rest.slice(lastAt + 1);

const firstColon = credentials.indexOf(':');

if (firstColon === -1) {
  console.error('No password found in that string.');
  process.exit(1);
}

const user = credentials.slice(0, firstColon);
const password = credentials.slice(firstColon + 1);

if (password.includes('[') || password.includes(']')) {
  console.error('That still has the [YOUR-PASSWORD] placeholder in it. Substitute the real one first.');
  process.exit(1);
}

// Already encoded strings are left alone rather than double encoded.
const alreadyEncoded = /%[0-9A-Fa-f]{2}/.test(password);
const encoded = alreadyEncoded ? password : encodeURIComponent(password);

console.log('');
console.log(alreadyEncoded ? 'Password already looked encoded, left as is.' : 'Password encoded.');
console.log('');
console.log(`${scheme}${user}:${encoded}@${hostAndPath}`);
console.log('');
