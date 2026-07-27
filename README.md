# Mon or Mon

A visual guessing game where you decide whether each creature is a Pokémon or a Digimon.

## Run locally

```bash
npm install
npm start
```

## Project notes

- [Research backlog](docs/research-backlog.md)

## Releases

Release Please runs on every push to `main`. It uses Conventional Commits to maintain a release pull request that updates `package.json` and `CHANGELOG.md`. Merging that release pull request publishes the GitHub release and deploys its tag to GitHub Pages.

Repository administrators must set **Settings → Actions → General → Workflow permissions** to **Read and write permissions**, and enable **Allow GitHub Actions to create and approve pull requests**. No personal access token is required: deployment is invoked from the same Release Please workflow because releases created with `GITHUB_TOKEN` do not trigger a separate `release` workflow.
