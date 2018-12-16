import path from 'path'
import {moveAndModifyAllTemplateFiles} from './modify'
import {dirExists, getRemakePath, getFilesFromDirectory} from './utils'

const defaultOptions = {
  overwrite: true,
  props: {},
}

/**
 * Generates files from a ./remake directory within the project
 * @param options {Object} The options for Reamke.
 * @param command {string} The command for Remake.
 * @param name {string} The name of the template.
 * @param entry {string} The location of the file(s).
 * @param output {string} The location to write the file(s).
 * @param props {Object} Props for the template.
 * @param overwrite {boolean} To overwrite the files.
 */
async function remake(options) {
  const {command, name, entry, output, overwrite, props} = {
    ...defaultOptions,
    ...options,
  }

  const remakeDirPath = getRemakePath()

  if (!command) {
    console.log('Please provide the name of template, like:')
    console.log('remake component --name=MyReactComponent')
    return
  }

  if (!dirExists(remakeDirPath)) {
    console.log("We can't find the .remake/ directory.")
    console.log('Please create one :)')
    return
  }

  // Name is required!
  if (!name) {
    console.log('Please provide a name. You can do it like:')
    console.log('--name=MyReactComponent or --name MyReactComponent')
    return
  }

  const cwd = process.cwd()
  const remakeTargetDir = entry || path.resolve(remakeDirPath, command)
  const dest = output || path.resolve(cwd, name)

  if (!dirExists(remakeTargetDir)) {
    console.log(`We can't find the .remake/${command} directory.`)
    console.log('Please create one :)')
    return
  }

  console.log(`Creating a ${command} with the name "${name}"!`)
  const files = getFilesFromDirectory(remakeTargetDir)

  moveAndModifyAllTemplateFiles({
    src: remakeTargetDir,
    dest,
    files,
    props,
    overwrite,
  })
}

export default remake
