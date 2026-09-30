# Deploying to cPanel (shared hosting)

This folder (`deploy_public/`) contains exactly what needs to go into **`public_html`**. The rest of the project (`app/`, `vendor/`, `bootstrap/`, `storage/`, etc.) goes into a folder called **`test`**, sitting next to `public_html` — same pattern as your other project.

## 1. Folder layout on the server

```
/home/yourusername/test/          ← the FULL project (this repo, everything)
/home/yourusername/public_html/   ← ONLY the contents of deploy_public/ go here
```

**Important:** upload the *contents* of `deploy_public/` into `public_html` — not the `deploy_public` folder itself. `public_html` should directly contain `index.php`, `.htaccess`, `build/`, `favicon.ico`, etc.

## 2. Upload steps

1. Upload/extract the whole project (everything except `deploy_public/` itself — it's only needed locally to build this folder) into `/home/yourusername/test`.
2. Upload every file from `deploy_public/` (`index.php`, `.htaccess`, `build/`, `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `robots.txt`) directly into `public_html`.
3. On the server, run `composer install --no-dev --optimize-autoloader` inside the `test` folder (via SSH/Terminal), or upload the `vendor/` folder if you built it locally.
4. Copy `.env.example` to `.env` inside `test`, fill in your real DB credentials and `APP_URL` (your domain), then run `php artisan key:generate`.
5. Run `php artisan migrate --force` (and `php artisan db:seed --force` only if you want the demo accounts).

## 3. If you name the app folder something other than "test"

Open `public_html/index.php` and change every `../test` to whatever you actually named the folder in step 1.

## 4. Storage link (screenshots won't show without this!)

Normally `php artisan storage:link` creates a symlink *inside the app's own `public/` folder*. That's not useful here, because the live web folder is `public_html`, not the `test` folder's `public/`. Instead, create the symlink directly in `public_html` pointing at the app's storage:

**Via SSH/Terminal (if available in cPanel):**
```bash
ln -s /home/yourusername/test/storage/app/public /home/yourusername/public_html/storage
```

**If you don't have terminal access:** ask your host to run that command, or check if cPanel's Terminal app is enabled for your account. cPanel's File Manager alone cannot create symlinks.

## 5. Future updates

- Code/backend changes: just re-upload the changed files into `test`.
- Frontend changes: run `npm run build` locally, then re-upload the new `public/build/` folder's contents into `public_html/build` (replacing the old one).
