import path from 'path'
import {moveAndModifyAllTemplateFiles} from './modify'
import {dirExists, getRemakePath, getFilesFromDirectory} from './utils'

const defaultOptions = {
  overwrite: false,
  props: {},
  silence: false,
}

/**
 * Generates files from a ./remake directory within the project
 * @param {Object} options The options for Reamke.
 * @param {string} command  The command for Remake.
 * @param {string} name  The name of the template.
 * @param {string} entry  The location of the file(s).
 * @param {string} output  The location to write the file(s).
 * @param {Object} props  Props for the template.
 * @param {boolean} silence  Suppresses the logs.
 * @param {boolean} overwrite  To overwrite the files.
 */
async function remake(options) {
  const {command, name, entry, output, overwrite, props, silence} = {
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
  const dest = output || cwd

  if (!dirExists(remakeTargetDir)) {
    console.log(`We can't find the .remake/${command} directory.`)
    console.log('Please create one :)')
    return
  }

  console.log(`📦  Creating a ${command} with the name "${name}"...`)
  console.log('')

  const files = getFilesFromDirectory(remakeTargetDir)

  function onComplete({dest: fileDest}) {
    if (!silence) {
      console.log(`   Generated ${fileDest}`)
    }
  }

  function onCompleteAll() {
    console.log('')
    console.log(`🙌  ${command} generation complete!`)
    console.log('')
  }

  moveAndModifyAllTemplateFiles({
    src: remakeTargetDir,
    dest,
    files,
    props,
    overwrite,
    onComplete,
    onCompleteAll,
  })
}

export default remake
