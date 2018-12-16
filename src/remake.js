import path from 'path'
import pkgUp from 'pkg-up'
import minimist from 'minimist'
import {moveAndModifyAllTemplateFiles} from './modify'
import {dirExists, getCommand, getFilesFromDirectory} from './utils'

async function remake() {
  const pkgPath = await pkgUp()
  const projectPath = path.dirname(pkgPath)
  const remakeDirPath = path.join(projectPath, '.remake')
  const args = minimist(process.argv.slice(2))
  const command = getCommand(args)

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
  const {name} = args
  if (!name) {
    console.log('Please provide a name. You can do it like:')
    console.log('--name=MyReactComponent or --name MyReactComponent')
    return
  }

  const {_, ...props} = args
  const cwd = process.cwd()
  const remakeTargetDir = path.resolve(remakeDirPath, command)
  const dest = path.resolve(cwd, name)

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
  })
}

export default remake
