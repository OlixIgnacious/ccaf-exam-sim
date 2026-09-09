# Pushing this repo to GitHub (private)

The local repo is already initialised and committed on branch `main`. You only need to
create the remote and push.

---

## Option A — GitHub CLI (two commands)

If you have `gh` installed and authenticated:

```bash
cd ~/Documents/workspace/Projects/ccaf-exam-sim
gh repo create ccaf-exam-sim --private --source=. --remote=origin --push
```

That single command creates the private repo, wires up `origin`, and pushes `main`.

**Don't have `gh`?**

```bash
brew install gh
gh auth login        # choose GitHub.com → HTTPS → log in with a browser
```

---

## Option B — Web UI + git (no CLI install)

1. Go to <https://github.com/new>
2. Repository name: `ccaf-exam-sim`
3. Select **Private**
4. Do **not** tick "Add a README", "Add .gitignore", or "Choose a license" —
   this repo already has them, and initialising would create a conflicting commit
5. Click **Create repository**
6. Back in Terminal:

```bash
cd ~/Documents/workspace/Projects/ccaf-exam-sim
git remote add origin https://github.com/<your-username>/ccaf-exam-sim.git
git push -u origin main
```

---

## Verify

```bash
git remote -v          # should show origin pointing at your repo
git log --oneline      # fa646f5 CCA-F exam simulator: ...
git status             # nothing to commit, working tree clean
```

---

## Making changes later

```bash
git add -A
git commit -m "describe what changed"
git push
```

---

## Check the commit author

The initial commit was authored as `Ashwini Sharma <ashwini.sharma0807@gmail.com>`.
If your GitHub account uses a different address, or you'd rather use GitHub's
`noreply` address to keep your email out of the public commit log:

```bash
# see what's recorded
git log -1 --format='%an <%ae>'

# rewrite just the initial commit, if you want to change it
git commit --amend --author="Your Name <your@email.com>" --no-edit
```

Do this **before** pushing — rewriting history after a push means a force-push.

---

## If you later make it public

Re-read the attribution note at the bottom of `README.md` first. Some of the adapted
question material comes from a repo with no declared licence, which means all rights
are reserved by default. Either confirm permission, or rewrite those items so the bank
is entirely original, before flipping visibility.
