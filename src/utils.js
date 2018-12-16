import fs from 'fs'
import path from 'path'
import pkgUp from 'pkg-up'

export const REMAKE_FILENAME_TOKEN = 'remake-'

/**
 * Retrieves the command from process args.
 * @param args {Object} The process args defined by Minimist.
 * @returns {string} The command.
 */
export function getCommand(args) {
  return args['_'] && args['_'][0]
}

/**
 * Reads the contents of a file.
 * @param filepath {string} The filepath to read.
 * @returns {string} The contents of the file.
 */
export function readFile(filepath) {
  return fs.readFileSync(filepath, 'utf8')
}

/**
 * Checks to see if the directory exists.
 * @param directory {string} The path of the directory to check.
 * @returns {boolean} The result.
 */

export function dirExists(directory) {
  return (
    fs.existsSync(directory) &&
    fs.statSync(path.resolve(directory)).isDirectory()
  )
}

/**
 * Retrieves the .remake/ directory from the project
 * @returns {string} The ./remake path
 */
export function getRemakePath() {
  const pkgPath = pkgUp.sync()
  if (!pkgPath) return null

  const projectPath = path.dirname(pkgPath)
  const remakeDirPath = path.join(projectPath, '.remake')

  return remakeDirPath
}

/**
 * Replaces the remake filename token from a filename with the matching prop
 * value, if applicable.
 * @param filename {string} The filename to parse.
 * @param props {Object} The properties to retrieve matching values from.
 * @returns {string} The updated filename.
 */
export function getFileNameFromProps(filename, props) {
  if (filename.indexOf(REMAKE_FILENAME_TOKEN) < 0) return filename

  // @ts-ignore
  // Using REMAKE_FILENAME_TOKEN in the matcher
  const propToReplace = filename.match(/remake-(\w+)/g)[0]
  if (!propToReplace) return filename

  const prop = props[propToReplace.replace(REMAKE_FILENAME_TOKEN, '')]
  if (!prop) return filename

  return filename.replace(propToReplace, prop)
}

/**
 * Flattens a deeply nested array.
 *
 * @param array {Array<any>} The array to flatten.
 * @returns {Array<any>} The flattened array.
 */
export function flattenDeep(array) {
  return array.reduce(
    (acc, val) =>
      Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
    [],
  )
}

/**
 * Walks through a directory to collect files and directories.
 * @param dir {string} The directory to walk through.
 * @param filelist {Array<any>} The collection of files
 * @returns {Array<any>} The accumulated collection of files.
 */
export function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const dirFile = path.join(dir, file)
    const dirent = fs.statSync(dirFile)
    if (dirent.isDirectory()) {
      const odir = {
        file: dirFile,
        files: [],
      }
      // @ts-ignore
      odir.files = walkSync(dirFile, dir.files)
      filelist.push(odir)
    } else {
      filelist.push({
        file: dirFile,
      })
    }
  }

  return filelist
}

/**
 * Flattens the walkSync results into a single-level Array.
 * @param walkResults {Array<any>} The walkSync collection to flatten.
 * @returns {Array<any>} The flattened walkSync collection.
 */
export function flattenWalkResults(walkResults) {
  return flattenDeep(
    walkResults.reduce((collection, result) => {
      if (result.files) {
        return [...collection, flattenWalkResults(result.files)]
      }
      return [...collection, result]
    }, []),
  )
}

/**
 * Retrieve all files from a directory as a flattened Array collection.
 * @param directory {string} The directory to walk through.
 * @returns {Array<any>} The flattened file collection
 */
export function getFilesFromDirectory(directory) {
  return flattenWalkResults(walkSync(directory)).map(result => result.file)
}
