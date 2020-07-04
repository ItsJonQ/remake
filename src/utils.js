const fs = require('fs');
const path = require('path');
const pkgUp = require('pkg-up');

const REMAKE_FILENAME_TOKEN = 'remake-';

/**
 * Checks if a callback is valid
 * @param {Function} callback The callback to check.
 * @returns {boolean} The result.
 */
function isCb(callback) {
	return callback && typeof callback === 'function';
}

/**
 * Retrieves the command from process args.
 * @param {Object} args The process args defined by Minimist.
 * @returns {string} The command.
 */
function getCommand(args) {
	return args['_'] && args['_'][0];
}

/**
 * Reads the contents of a file.
 * @param {string} filepath  The filepath to read.
 * @returns {string} The contents of the file.
 */
function readFile(filepath) {
	return fs.readFileSync(filepath, 'utf8');
}

/**
 * Checks to see if the directory exists.
 * @param {string} directory The path of the directory to check.
 * @returns {boolean} The result.
 */
function dirExists(directory) {
	return (
		fs.existsSync(directory) &&
		fs.statSync(path.resolve(directory)).isDirectory()
	);
}

/**
 * Retrieves the project's root path.
 * @returns {string} The project root path.
 */
function getProjectRootPath() {
	const pkgPath = pkgUp.sync();
	if (!pkgPath) return null;

	return path.dirname(pkgPath);
}

/**
 * Retrieves the .remake/ directory from the project
 * @returns {string} The ./remake path
 */
function getRemakePath() {
	const projectPath = getProjectRootPath();
	if (!projectPath) return null;

	const remakeDirPath = path.join(projectPath, '.remake');

	return remakeDirPath;
}

/**
 * Replaces the remake filename token from a filename with the matching prop
 * value, if applicable.
 * @param {string} filename The filename to parse.
 * @param {Object} props The properties to retrieve matching values from.
 * @returns {string} The updated filename.
 */
function getFileNameFromProps(filename, props) {
	if (filename.indexOf(REMAKE_FILENAME_TOKEN) < 0) return filename;

	const cwd = process.cwd();
	const baseFileNames = filename.split(cwd);
	const isDir = baseFileNames.length > 1;

	const baseFileName = isDir
		? baseFileNames[baseFileNames.length - 1]
		: baseFileNames[0];

	if (!baseFileName) return filename;

	// Finding any REMAKE_FILENAME_TOKEN
	const propMatches = baseFileName.match(/remake-(\w+)/g);
	if (!propMatches) return filename;

	// Using REMAKE_FILENAME_TOKEN in the matcher
	const propToReplace = propMatches[0];
	const prop = props[propToReplace.replace(REMAKE_FILENAME_TOKEN, '')];
	if (!prop) return filename;

	const nextFileName = filename.replace(propToReplace, prop);

	return isDir ? path.resolve(cwd, nextFileName) : nextFileName;
}

/**
 * Flattens a deeply nested array.
 *
 * @param array {Array<any>} The array to flatten.
 * @returns {Array<any>} The flattened array.
 */
function flattenDeep(array) {
	return array.reduce(
		(acc, val) =>
			Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
		[],
	);
}

/**
 * Walks through a directory to collect files and directories.
 * @param {string} dir The directory to walk through.
 * @param {Array<any>} filelist The collection of files
 * @returns {Array<any>} The accumulated collection of files.
 */
function walkSync(dir, filelist = []) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const dirFile = path.join(dir, file);
		const dirent = fs.statSync(dirFile);
		if (dirent.isDirectory()) {
			const odir = {
				file: dirFile,
				files: [],
			};
			// @ts-ignore
			odir.files = walkSync(dirFile, dir.files);
			filelist.push(odir);
		} else {
			filelist.push({
				file: dirFile,
			});
		}
	}

	return filelist;
}

/**
 * Flattens the walkSync results into a single-level Array.
 * @param {Array<any>} walkResults The walkSync collection to flatten.
 * @returns {Array<any>} The flattened walkSync collection.
 */
function flattenWalkResults(walkResults) {
	return flattenDeep(
		walkResults.reduce((collection, result) => {
			if (result.files) {
				return [...collection, flattenWalkResults(result.files)];
			}
			return [...collection, result];
		}, []),
	);
}

/**
 * Retrieve all files from a directory as a flattened Array collection.
 * @param {string} directory  The directory to walk through.
 * @returns {Array<any>} The flattened file collection
 */
function getFilesFromDirectory(directory) {
	return flattenWalkResults(walkSync(directory)).map((result) => result.file);
}

/**
 * Retrieves the relative path of a directory to the project's root path.
 * @param {string} filepath The directory/file path to retrieve against project root.
 * @param {string} name The name of the directory.
 * @returns {string} The full path relative to the project root.
 */
function getRelativePath(filepath, name = '') {
	if (!filepath) return undefined;

	const basePath = getProjectRootPath();
	if (!basePath) return undefined;

	return path.resolve(basePath, filepath, name) || undefined;
}

/**
 * Retrieves the relative path of a directory to the project's .remake/
 * directory.
 * @param {string} filepath The directory/file path to retrieve against .remake/.
 * @returns {string} The full path relative to the project .remake/.
 */
function getRelativeRemakePath(filepath) {
	if (!filepath) return undefined;

	const remakePath = getRemakePath();
	if (!remakePath) return undefined;

	return path.resolve(remakePath, filepath) || undefined;
}

module.exports = {
	isCb,
	getCommand,
	getRemakePath,
	readFile,
	dirExists,
	getFileNameFromProps,
	getFilesFromDirectory,
	getRelativePath,
	getRelativeRemakePath,
};
