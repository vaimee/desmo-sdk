# Typescript Template (Typescript Starter Project) for Node Modules and CLIs

#### Customize the template

1. Run `npm install` to install all dependencies
2. (Optional) Run `npm outdated` to see if any dependencies have major updates.
3. (Optional) Run `npm update` to get those dependencies up to date with minor updates.
4. Update the `package.json` with your project's details
   - Set the `name` field. If you are going to publish to npm, this will be the name of your package. Must be a URL-friendly name. Best practice is to use kebab-case (all lower-case, alphanumeric and dashes).
   - Set the `description` field.
   - Set the `repository` field to your remote git repo's URL.
   - Set the `homepage` field (your remote git repo's URL works fine for this).
   - Add any `keywords` strings. If you publish to npm, these will be used by searches.
   - Remove the `private` field **if you want to publish to npm**.
   - If you do not want to publish to npm, remove `&& npm publish` from the `scripts.postversion` script.
5. Check the `.gitignore` and add any filetypes or folders you want to keep out of your repo.
6. Remove any stuff from the template that you don't care about. (You can do this at any time.)
7. Open up the `./tsconfig.json` file to see if you want to change anything. Pay particular attention to the `paths` section!
8. Commit all your changes: `git add -A; git commit`
9. Push your commit: `git push`

### Begin coding!

- Your entrypoint is `./src/index.ts`, so start there!
- Your compiled code will appear in a git-ignored `build` folder, with entrypoint `build/index.js`.
- To compile, run `npm run build`
- To auto-recompile while you code, run `npm run build-live`
- Sample folders and files for types and your code library are placed in `src/lib` and `src/types`.
- If you intend to use the `fs-extra` module for anything in your non-test code,
  move it from the `devDependencies` to the `dependencies` section of your `package.json`.

### Creating a CLI (Command Line Interface)

This template project comes with the [commander module](https://www.npmjs.com/package/commander),
which is great for rapidly building command line interfaces
(uninstall it with `npm uninstall commander` if you don't need to make a CLI).

To create a CLI that will become available when someone installs your npm package:

- Rename `src/cli/cli.ts` to `src/cli/your-main-cli-name.ts`. This is the entrypoint
  for your CLI.
- Name any subcommand files to `src/cli/your-main-cli-name-subcommand.ts`.
  Update the CLI entrypoint to use the same subcommand names.
  Subcommand scripts _must_ start with the same name as your main CLI script,
  and _must_ end with an exact command name listed by its parent script
  (one of the `cli.command()` values).
- Modify the CLI templates to do whatever it's all supposed to do.
- To make `your-cli-command` available to users who install your
  npm package, add the `bin` field to your `package.json`, like so:
  ```jsonc
  {
    //... other root package.json options
    "bin": {
      "your-cli-command": "build/cli/your-main-cli-name.js"
    }
  }
  ```

Test your CLI locally by running `node build/cli/your-main-cli-name.js -h`.

If you publish your project as an npm module, users who install it will be able
to run `npx your-cli-command` in their terminals, or simply `your-cli-command`
if they've done a global install of your module (with `npm install --global your-module-name`).

### Testing

- Add tests to `./src/test` as you go.
- Place any reference data for tests into `./samples`
- Run tests from the terminal with `npm test` (make sure your code is compiled first).
- Run tests from VSCode (click the debugger on the sidebar) to use breakpoints and allow inspection:
  - Use the "Tests" option to run against your compiled code.
  - Console logs will appear in the Debug Console, where you can also step through your code if you set breakpoints.
  - Edit `./.vscode/launch.json` to add or change the tests.

### Versioning and publishing to npm

When you are ready to increment the version of your project, which by default
is coupled to publishing to `npm` and merging into your `main` branch
(edit this behavior in the `scripts` section of the `package.json`),
use the `npm version` commands. For example:

- `npm version patch` to bump the patch version, indicated a bugfix
- `npm version minor` to bump the minor version, indicating a new feature (backwards-compatible)
- `npm version major` to bump the major version, indicating substantial and/or breaking changes

The `preversion`, `version`, and `postversion` scripts in the `package.json` file dictate what happens
when you use an `npm version` command. By default, the sequence of things that happen are:

1. Source is compiled into plain JavaScript.
2. Tests are run against the compiled JavaScript. If any fail, the process aborts.
3. Increment the version number in the `package.json` file.
4. Update `CHANGELOG.md` to reflect the new version.
5. `git add` all file changes.
6. Commit changes and create a version tag.
7. Push changes to remote
8. Publish package to `npm`.
