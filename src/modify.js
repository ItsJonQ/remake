const fs = require('fs');
const path = require('path');
const template = require('lodash.template');
const mkdirp = require('mkdirp');
const { readFile, getFileNameFromProps, isCb } = require('./utils');

/**
 * Creates the modified filename based on the dest and props.
 * @param {string} src The source of the file.
 * @param {string} dest The destination to write the file.
 * @param {string} filepath The filepath to modify.
 * @param {Object} props The props to use in the template.
 * @returns {string} The modified filename.
 */
function getModifiedFileName({ src, dest, filepath, props }) {
	const fileDest = filepath.replace(src, dest);

	const [filename, ...rest] = path.basename(fileDest).split('.');
	const ext = rest.join('.');

	// Create the next file name
	const nextFileDest = getFileNameFromProps(fileDest, props);
	const nextFileName = getFileNameFromProps(filename, props);

	const modifiedFileName = path.resolve(
		path.dirname(nextFileDest),
		`${nextFileName}.${ext}`,
	);

	return modifiedFileName;
}

/**
 * Move a file to a new location while modifying it's content with provided
 * props.
 * @param {string} filepath The filepath to modify.
 * @param {string} dest The destination to write the file.
 * @param {Object} props The props to use in the template.
 * @param {boolean} overwrite The option to overwrite files.
 * @param {Function} onComplete Callback when on generated file.
 */
function moveAndModifyTemplateFile({
	filepath,
	dest,
	props,
	overwrite,
	onComplete,
}) {
	const nextDir = path.dirname(dest);
	const data = readFile(filepath);
	const nextData = template(data)(props);

	const writeOptions = {
		encoding: 'utf8',
	};

	if (overwrite) {
		writeOptions.flag = 'w';
	}

	mkdirp.sync(nextDir);
	fs.writeFileSync(dest, nextData, writeOptions);

	if (isCb(onComplete)) {
		onComplete({ dest, data: nextData });
	}
}

/**
 * Move a collection of files to a new location while modifying it's content
 * with provided props.
 * @param {string} src The source of the files.
 * @param {string} dest The destination to write the file.
 * @param {Array<string>} files The collection of files to modify.
 * @param {Object} props  The props to use in the template.
 * @param {boolean} overwrite The option to overwrite files.
 * @param {Function} onComplete Callback when on generated file.
 * @param {Function} onCompleteAll Callback when on generated all files.
 */
function moveAndModifyAllTemplateFiles({
	src,
	dest,
	files,
	props,
	overwrite,
	onComplete,
	onCompleteAll,
}) {
	files.forEach((file) => {
		const modifiedFileName = getModifiedFileName({
			src,
			dest,
			filepath: file,
			props,
		});

		moveAndModifyTemplateFile({
			filepath: file,
			dest: modifiedFileName,
			props,
			overwrite,
			onComplete,
		});
	});

	if (isCb(onCompleteAll)) {
		onCompleteAll();
	}
}

module.exports = {
	getModifiedFileName,
	moveAndModifyTemplateFile,
	moveAndModifyAllTemplateFiles,
};
