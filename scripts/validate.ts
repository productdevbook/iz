#!/usr/bin/env bun
// Validates every entry under people/ against people/_schema.json and the
// evidence rules in POLICY.md.
//
// This catches structural mistakes only. It cannot tell whether a source is
// truthful, whether two sources are genuinely independent, or whether the
// person named is the person meant. A human reviewer does that.

import { readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { parse as parseYaml } from 'yaml'

const root = join(import.meta.dir, '..')
const peopleDir = join(root, 'people')

/** Source kinds that carry weight on their own. */
const PRIMARY_KINDS = new Set(['family', 'obituary', 'employer', 'project', 'news'])
const MIN_PRIMARY_SOURCES = 2

interface Source {
  url?: string
  title?: string
  kind?: string
  publisher?: string
  date?: string
  archived?: string
}

interface Entry {
  id?: string
  name?: string
  born?: string
  died?: string
  summary?: string
  sources?: Source[]
  verified_by?: string[]
  [key: string]: unknown
}

interface JsonSchema {
  type?: string
  required?: string[]
  properties?: Record<string, JsonSchema>
  additionalProperties?: boolean
  items?: JsonSchema
  minItems?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  enum?: string[]
  format?: string
}

interface Problem {
  file: string
  message: string
}

const problems: Problem[] = []
const fail = (file: string, message: string): void => {
  problems.push({ file, message })
}

/**
 * A small structural validator covering the subset of JSON Schema this
 * project's schema uses. Avoids pulling a validation dependency into a repo
 * whose whole point is being easy to audit end to end.
 */
function validateObject(value: unknown, schema: JsonSchema, path: string, file: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(file, `${path || 'root'}: expected an object`)
    return
  }
  const obj = value as Record<string, unknown>

  for (const key of schema.required ?? []) {
    if (!(key in obj)) fail(file, `${path || 'root'}: missing required field "${key}"`)
  }
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(obj)) {
      if (!(key in (schema.properties ?? {}))) {
        fail(file, `${path || 'root'}: unknown field "${key}"`)
      }
    }
  }
  for (const [key, sub] of Object.entries(schema.properties ?? {})) {
    if (key in obj) validate(obj[key], sub, path ? `${path}.${key}` : key, file)
  }
}

function validateArray(value: unknown, schema: JsonSchema, path: string, file: string): void {
  if (!Array.isArray(value)) {
    fail(file, `${path}: expected a list`)
    return
  }
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    fail(file, `${path}: needs at least ${schema.minItems} entries, found ${value.length}`)
  }
  value.forEach((item, i) => validate(item, schema.items ?? {}, `${path}[${i}]`, file))
}

function validateString(value: unknown, schema: JsonSchema, path: string, file: string): void {
  if (typeof value !== 'string') {
    fail(file, `${path}: expected text`)
    return
  }
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    fail(file, `${path}: too short (minimum ${schema.minLength} characters)`)
  }
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    fail(file, `${path}: too long (maximum ${schema.maxLength} characters)`)
  }
  if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) {
    fail(file, `${path}: "${value}" does not match the expected format`)
  }
  if (schema.enum && !schema.enum.includes(value)) {
    fail(file, `${path}: "${value}" is not one of: ${schema.enum.join(', ')}`)
  }
  if (schema.format === 'uri' && !/^https?:\/\/\S+$/u.test(value)) {
    fail(file, `${path}: "${value}" is not an http(s) URL`)
  }
}

function validate(value: unknown, schema: JsonSchema, path: string, file: string): void {
  if (schema.type === 'object') validateObject(value, schema, path, file)
  else if (schema.type === 'array') validateArray(value, schema, path, file)
  else if (schema.type === 'string') validateString(value, schema, path, file)
}

/** Rules from POLICY.md that the schema alone cannot express. */
function checkPolicy(entry: Entry, file: string): void {
  const sources = Array.isArray(entry.sources) ? entry.sources : []
  const primary = sources.filter((s) => s?.kind !== undefined && PRIMARY_KINDS.has(s.kind))

  if (primary.length < MIN_PRIMARY_SOURCES) {
    fail(
      file,
      `POLICY: needs at least ${MIN_PRIMARY_SOURCES} primary sources, found ${primary.length}. ` +
        `"reference" sources support an entry but do not establish it.`,
    )
  }

  // Two links to the same host are usually one outlet republishing itself,
  // which is not independent corroboration. Flag it for the reviewer to judge.
  const seen = new Set<string>()
  for (const source of primary) {
    let host: string
    try {
      host = new URL(source.url ?? '').hostname.replace(/^www\./u, '')
    } catch {
      continue
    }
    if (seen.has(host)) {
      fail(file, `POLICY: two primary sources come from "${host}" — confirm they are independent`)
    }
    seen.add(host)
  }

  const expectedId = basename(file, '.yml')
  if (entry.id && entry.id !== expectedId) {
    fail(file, `id "${entry.id}" does not match the filename "${expectedId}"`)
  }

  if (entry.born && entry.died && entry.born > entry.died) {
    fail(file, `born (${entry.born}) is after died (${entry.died})`)
  }

  if (!entry.verified_by?.length) {
    fail(file, 'POLICY: verified_by is empty — a maintainer must confirm every source before merge')
  }
}

const schema = (await Bun.file(join(peopleDir, '_schema.json')).json()) as JsonSchema

const files = (await readdir(peopleDir))
  .filter((f) => f.endsWith('.yml') && !f.startsWith('_'))
  .toSorted()

for (const file of files) {
  let entry: Entry
  try {
    entry = parseYaml(await Bun.file(join(peopleDir, file)).text()) as Entry
  } catch (error) {
    fail(file, `could not read the file: ${(error as Error).message}`)
    continue
  }
  validate(entry, schema, '', file)
  checkPolicy(entry, file)
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s) found:\n`)
  for (const { file, message } of problems) console.error(`  ${file}\n    ${message}\n`)
  console.error('Nothing is published until these are resolved. See POLICY.md.\n')
  process.exit(1)
}

console.log(`${files.length} entr${files.length === 1 ? 'y' : 'ies'} checked. All structurally valid.`)
console.log('Structure is not truth — a maintainer must still open every source link.')
