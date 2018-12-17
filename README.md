# 🦋 Remake

[![Build Status](https://travis-ci.org/ItsJonQ/remake-cli.svg?branch=master)](https://travis-ci.org/ItsJonQ/remake-cli)
[![npm version](https://badge.fury.io/js/remake-cli.svg)](https://badge.fury.io/js/remake-cli)

> A simple generator from locally defined templates!

```
Usage: remake-cli
  🦋  Remake

  remake <cmd> --option

  Example:
  remake component --name=MyComponent --someProp=value


Options:
  -V, --version    output the version number
  -n, --name       The name for the generate file(s)
  -o, --output     Location to output generated file(s)
  -i, --entry      Location of the template file(s)
  -w, --overwrite  Overwrite existing files
  -s, --silence    Suppresses the logs
  -h, --help       output usage information

Commands:
  *              The directory name for the template under .remake/
```

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [Create the template files](#create-the-template-files)
  - [Run the command](#run-the-command)
- [Example](#example)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
npm install --save-dev remake-cli
```

To install it globally, run:

```
npm install -g remake-cli
```

## Usage

### Create the template files

In your project's root directory, create a new directory called `.remake`:

```
my-app/
├── .remake/
└── .../
```

Within the `.remake` directory, create sub directories to associate with "commands" that you would like Remake to run. In this example, we'll create a directory called `component`, which Remake will use when running the command `component`:

```
my-app/
├── .remake/
│   └── component/
└── .../
```

Under the new `component` directory, we'll add a couple of files that we want Remake to generate for us:

```
my-app/
├── .remake/
│   └── component/
│       └── remake-name/
│           ├── index.js
│           └── remake-name.js
└── .../
```

Notice the `remake-name` directory and `remake-name.js` file. Remake will use `props` you provide to replace any `remake-*` file name. For this example, the file name will be replaced with the `name` prop.

Within the `remake-name.js`, let's add some template content:

```jsx
// component/remake-name/remake-name.js
import React from 'react'

export class <%= name %> extends React.PureComponent {
  render () {
    return <div />
  }
}

export default <%= name %>
```

Notice the `<%= name %>`. Remake uses [lodash.template](https://lodash.com/docs/4.17.11#template) to parse and modify template files. The `name` prop is provided to the template through CLI arguments. You can specify anything you'd like! Including `if/else` logic, if you wanna get fancy.

### Run the command

Once you're happy with your template files, run the `remake` command.

The recommended way is to add a `remake` script to your project's `package.json`, like so:

```
  ...
  "remake": "remake",
  ...
```

You can even add the options to dedicated `remake` scripts for more commonly generated templates:

```
"remake:component": "remake-cli component --output=src/components"
```

Alternatively, if you've installed `remake` globally, you can run:

```
remake component --name=Hello
```

For this example, remake will generate the following files:

```
my-app/
├── .remake/
│   └── component/
│       └── remake-name/
│           ├── index.js
│           └── remake-name.js
├── Hello
│   ├── index.js
│   └── Hello.js
└── .../
```

If we take a look at `Hello.js`, you'll see that the `<%= name %>` variables have been replaced by `Hello`, specified by `--name=Hello`:

```jsx
// Hello/Hello.js
import React from 'react'

export class Hello extends React.PureComponent {
  render() {
    return <div />
  }
}

export default Hello
```

## Example

Check out the example in the [`__tests__` directory](https://github.com/ItsJonQ/remake-cli/tree/master/__tests__) 🙌

## License

MIT © [Q](https://jonquach.com)
