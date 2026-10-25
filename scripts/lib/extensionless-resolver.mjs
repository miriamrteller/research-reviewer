/**
 * @material/material-color-utilities ships ESM with extensionless relative
 * imports (`import './dynamic_color'`), which bundlers accept and Node does
 * not. This resolve hook retries such specifiers with `.js` appended, and
 * only for that package, so nothing else in the toolchain is affected.
 */
const PACKAGE = '/@material/material-color-utilities/'

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context)
  } catch (error) {
    const isRelative = /^\.\.?\//.test(specifier)
    const hasExtension = /\.[cm]?js$/.test(specifier)
    const fromPackage = context.parentURL?.includes(PACKAGE) ?? false
    if (error?.code === 'ERR_MODULE_NOT_FOUND' && isRelative && !hasExtension && fromPackage) {
      return next(`${specifier}.js`, context)
    }
    throw error
  }
}
