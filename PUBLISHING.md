# Publishing

To publish a new version of failable:

1. Make sure you are logged in by running
   [`npm whoami`](https://docs.npmjs.com/cli/whoami).
2. Ensure the project builds (`npm run build`) and the tests pass (`npm test`).
3. Use [`npm version`](https://docs.npmjs.com/cli/version) to bump the version
   number.
4. Use the run script `npm run prepare` to build and copy necessary files to `lib`.
5. Run [`npm publish ./lib`](https://docs.npmjs.com/cli/publish) to publish.
