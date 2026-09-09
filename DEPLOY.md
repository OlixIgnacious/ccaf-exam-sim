# CCA-F Exam Simulator — getting it onto your phone and tablet

`index.html` is fully self-contained: no build step, no dependencies, no network calls.
Any of the routes below will work. They're ordered easiest first.

---

## Option 1 — Netlify Drop (easiest, ~60 seconds, free)

No CLI, no install.

1. Open <https://app.netlify.com/drop> on your Mac
2. Drag this whole `cca-quiz-site` folder onto the page
3. You get a live URL immediately (e.g. `https://cheerful-otter-1a2b3c.netlify.app`)
4. Open that URL on your phone and tablet

Claim the site with a free account if you want to keep the URL permanently and get a
nicer name. To update later, drag the folder again.

---

## Option 2 — Firebase Hosting (free Spark tier)

This folder is already configured — `firebase.json` is set up to serve `index.html`.

```bash
# one-time setup
npm install -g firebase-tools
firebase login

# create a project at https://console.firebase.google.com first,
# then put its project ID into .firebaserc (replacing the placeholder)

cd cca-quiz-site
firebase deploy --only hosting
```

You'll get `https://<your-project>.web.app`. Redeploy with the same command after any edit.

If you'd rather not hand-edit `.firebaserc`, run `firebase init hosting` instead and
accept `.` as the public directory when prompted.

---

## Option 3 — Local network only (no internet, no account)

Good if you only study at home and would rather nothing be published.

```bash
cd cca-quiz-site
python3 -m http.server 8000
```

Then find your Mac's LAN address:

```bash
ipconfig getifaddr en0        # Wi-Fi
ipconfig getifaddr en1        # Ethernet, if en0 returns nothing
```

On your phone/tablet (same Wi-Fi), visit `http://<that-address>:8000`
— e.g. `http://192.168.1.24:8000`

Caveats: your Mac must stay awake and on the same network, and the terminal window
must stay open. Some Wi-Fi networks (guest networks, hotel, corporate) block
device-to-device traffic and this won't work there.

---

## Option 4 — No server at all

Email or AirDrop `index.html` to yourself, save it to Files / Google Drive, and open it
in your mobile browser. Works fully offline. Slightly awkward to reopen each time, and
on some Android browsers local files behave inconsistently.

---

## Add it to your home screen

Once it's on a URL (options 1–3), it behaves like an app:

- **iOS Safari** — Share → Add to Home Screen
- **Android Chrome** — ⋮ menu → Add to Home screen

It'll launch fullscreen without browser chrome.

---

## What about Supabase?

Supabase is a backend platform — Postgres, auth, realtime, storage. It has no static
site hosting product. You *can* force it by uploading the file to a public Storage
bucket, but you'd get an awkward URL, no proper index routing, and no CDN caching
benefit. Firebase Hosting, Netlify, GitHub Pages, and Cloudflare Pages are all built for
exactly this and are all free at this scale. Use one of those instead.

---

## One thing to know about your attempt history

Scores are stored in the browser's `localStorage`, which is per-device and per-origin.
So:

- Your phone and your tablet each keep **separate** attempt histories
- History saved on the local file (`file://`) will **not** appear on the hosted URL
- Clearing browser data wipes it

That's fine for practice — just don't expect one synced record across devices. If you
want that, the app would need a real backend, which *would* be a reasonable use of
Supabase. Ask if you want that built.

---

## Privacy note

Options 1 and 2 publish to a public URL. It's unlisted and unguessable, but not
password-protected. There's nothing sensitive here — the questions are original or
adapted from public community study guides — but if you'd rather keep it private, use
option 3 or 4.
