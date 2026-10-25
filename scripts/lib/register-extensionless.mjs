// Node preload: `node --import ./scripts/lib/register-extensionless.mjs <script>`
import { register } from 'node:module'

register('./extensionless-resolver.mjs', import.meta.url)
