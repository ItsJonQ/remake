import fs from 'fs'
import path from 'path'
import template from 'lodash.template'
import mkdirp from 'mkdirp'
import {readFile, getFileNameFromProps} from './utils'

/**
 * Creates the modified filename based on the dest and props.
 * @param src {string} The source of the file.
 * @param dest {string} The destination to write the file.
 * @param filepath {string} The filepath to modify.
 * @param props {Object} The props to use in the template.
 * @returns {string} The modified filename.
 */
export function getModifiedFileName({src, dest, filepath, props}) {
  const fileDest = filepath.replace(src, dest)

  const [filename, ...rest] = path.basename(fileDest).split('.')
  const ext = rest.join('.')

  // Create the next file name
  const nextFileName = getFileNameFromProps(filename, props)
  const modifiedFileName = path.resolve(
    path.dirname(fileDest),
    `${nextFileName}.${ext}`,
  )

  return modifiedFileName
}

/**
 * Move a file to a new location while modifying it's content with provided
 * props.
 * @param filepath {string} The filepath to modify.
 * @param dest {string} The destination to write the file.
 * @param props {Object} The props to use in the template.
 * @param overwrite {boolean} The option to overwrite files.
 */
export function moveAndModifyTemplateFile({filepath, dest, props, overwrite}) {
  const nextDir = path.dirname(dest)
  const data = readFile(filepath)
  const nextData = template(data)(props)

  const writeOptions = {
    encoding: 'utf8',
  }

  if (overwrite) {
    writeOptions.flag = 'w'
  }

  mkdirp(nextDir, () => {
    fs.writeFileSync(dest, nextData, writeOptions)
  })
}

/**
 * Move a collection of files to a new location while modifying it's content
 * with provided props.
 * @param src {string} The source of the files.
 * @param dest {string} The destination to write the file.
 * @param files {Array<string>} The collection of files to modify.
 * @param props {Object} The props to use in the template.
 * @param overwrite {boolean} The option to overwrite files.
 */
export function moveAndModifyAllTemplateFiles({
  src,
  dest,
  files,
  props,
  overwrite,
}) {
  files.forEach(file => {
    const modifiedFileName = getModifiedFileName({
      src,
      dest,
      filepath: file,
      props,
      overwrite,
    })
    moveAndModifyTemplateFile({filepath: file, dest: modifiedFileName, props})
  })
}
