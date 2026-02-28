# 📧 ColdMail

A local cold email tool with contact management, SMTP account rotation, file attachments, **scheduled sending with natural 1-3h delays**, AI-powered email improvement via OpenAI, **dark/light mode**, and **PL/ENG language switching**.

---

## Table of Contents

- [👤 For End Users (Non-Technical Guide)](#-for-end-users-non-technical-guide)
- [🛠️ For Developers](#️-for-developers)

---

# 👤 For End Users (Non-Technical Guide)

> Read step by step – do not skip any stage!

### Contents

1. [Installing Node.js (one time only!)](#1-installing-nodejs-one-time-only)
2. [How to open the terminal from the folder](#2-how-to-open-the-terminal-from-the-folder)
3. [Starting the app – terminal commands](#3-starting-the-app--terminal-commands)
4. [When to open the browser](#4-when-to-open-the-browser)
5. [How to handle errors](#5-how-to-handle-errors)
6. [Where to add links](#6-where-to-add-links)
7. [Contact list (Lista kontaktów)](#7-contact-list-brands)
8. [SMTP accounts (sending mailboxes)](#8-smtp-accounts-sending-mailboxes)
9. [OpenAI key (for AI email improvement)](#9-openai-key-for-ai-email-improvement)
10. [General app usage](#10-general-app-usage)
11. [Scheduled email sending](#11-scheduled-email-sending)
12. [Dark/Light mode and language](#12-darklight-mode-and-language)
13. [Shutting down the app](#13-shutting-down-the-app)

---

## 1. Installing Node.js (one time only!)

Node.js is a program that makes the app work on your computer.  
**You only install it once – you never have to do it again.**

### Steps:

1. Go to: **https://nodejs.org**
2. Click the big green button labeled **"LTS"** (stable version)
3. A `.msi` file will download – run it by double-clicking
4. Click **"Next"** on every screen of the installer, change nothing
5. At the end click **"Finish"**
6. **Restart your computer**

### How to verify Node.js is installed:

1. Press **Windows + R** on your keyboard
2. Type `cmd` and press **Enter**
3. In the black window type: `node --version` and press **Enter**
4. If you see something like `v20.11.0` – you're good! ✅
5. If you see an error – reinstall Node.js from the beginning

---

## 2. How to open the terminal from the folder

The **terminal** (also called command prompt) is a black window where you type commands.  
You need to open it in the right place – in the `coldmail-app` folder.

### Method (easiest – File Explorer):

1. Open **File Explorer** (yellow folder icon in the taskbar)
2. Navigate to: `Desktop` → `ColdMail` → `coldmail-app`
3. Click in the **address bar** at the top of the window (where you see the path)  
   *(it should highlight in blue)*
4. Type `cmd` and press **Enter**
5. A black terminal window will open – this is the terminal in the right place ✅

> 💡 **Tip:** You can also right-click in an empty area inside the `coldmail-app` folder and choose **"Open in Terminal"**.

---

## 3. Starting the app – terminal commands

After opening the terminal in the `coldmail-app` folder, type the following commands.

### First time only (when running for the first time):

```
npm install
```

> Type this command and wait – it can take a few minutes. The terminal will print various things.  
> Do not close the window until the blinking cursor returns.

### Every subsequent launch:

```
npm run dev
```

> Type this command and press **Enter**.  
> Wait until you see something like:
> ```
> ✓ Ready in 2.5s
> ```
> This means the app is running! ✅

---

## 4. When to open the browser

**After typing `npm run dev` and seeing the `Ready` message:**

1. Open a browser (Chrome, Edge, Firefox – any)
2. In the address bar at the top type exactly:

```
http://localhost:3000
```

3. Press **Enter**
4. ColdMail should open! ✅

> ⚠️ **Important:** The terminal must stay open the whole time you are using the app.  
> If you close the terminal – the app will stop working.

---

## 5. How to handle errors

### Error: "npm is not recognized"
**Cause:** Node.js is not installed or the computer needs a restart.  
**Fix:** Install Node.js (see step 1) and restart your computer.

---

### Error: "Cannot find module" or red text on launch
**Cause:** Missing installed packages.  
**Fix:**
1. In the terminal type: `npm install`
2. Wait for it to finish
3. Then type again: `npm run dev`

---

### Error: Page doesn't open in browser ("Can't reach this page")
**Cause:** The app hasn't started yet or the terminal is closed.  
**Fix:**
1. Check if the terminal is open
2. Check if you can see the word `Ready` in the terminal
3. Make sure you're typing exactly: `http://localhost:3000`

---

### Error: "Port 3000 is already in use"
**Cause:** The app is already running in the background.  
**Fix:**
1. Close all terminal windows
2. Reopen the terminal and type `npm run dev`

---

### The app sends an email but shows an SMTP error
**Cause:** Wrong server address, port, or password in `accounts.csv`.  
**Fix:** Check the `accounts.csv` file (see step 8).

---

### Nothing helps?
1. Close the terminal
2. Restart the computer
3. Open the terminal in the `coldmail-app` folder
4. Type `npm run dev`
5. Open the browser at `http://localhost:3000`

---

## 6. Where to add links

Linki are website addresses you can insert into email content.  
They are stored in `data_source/links.csv` inside the `coldmail-app` folder.

### File format:
```
website name,url
youtube, https://youtube.com
my site, https://mysite.com
```

### How to add a new link (via file):
1. Open `coldmail-app/data_source/links.csv` in Notepad
2. On a new line type:
```
site name, https://site-address.com
```
3. Save the file (**Ctrl+S**)
4. Refresh the app page in the browser (**F5**)

> ⚠️ **Warning:** Do not delete the first line (`website name,url`) – it is the header!

### Adding a link through the app:
1. Open the app in the browser at `http://localhost:3000`
2. Click **"Linki"** in the menu
3. Click the **"Add"** button
4. Enter the site name and URL
5. Click **"Save"**

---

## 7. Contact list (Lista kontaktów)

Contacts (companies/people you send emails to) are stored in `data_source/brands.csv`.

### File format:
```
name,email
John Smith, john.smith@example.com
Company XYZ, contact@companyxyz.com
```

### How to add a new contact (via file):
1. Open `coldmail-app/data_source/brands.csv` in Notepad
2. Add a new line:
```
First Last or Company Name, address@email.com
```
3. Save (**Ctrl+S**)

### How to add a contact (via app):
1. In the app click **"Lista kontaktów"** in the left menu
2. Fill in the form with name and email address
3. Click **"Add Brand"**

> ⚠️ **Warning:** Do not delete the first line (`name,email`) – it is the header!  
> ⚠️ The email must be valid (format: `someone@domain.com`) – otherwise the app will reject it.

---

## 8. SMTP accounts (sending mailboxes)

An SMTP account is the email mailbox the app uses to send messages.  
The data is stored in `data_source/accounts.csv`.

### File format:
```
smtp_server,smtp_port,smtp_username,smtp_password
smtp.gmail.com,587,yourmail@gmail.com,app_password
```

### What to put in each field:

| Field | What it is | Example |
|-------|-----------|--------|
| `smtp_server` | Mail server | `smtp.gmail.com` |
| `smtp_port` | Port (keep 587) | `587` |
| `smtp_username` | Your email address | `jan@gmail.com` |
| `smtp_password` | **App password** (not your normal one!) | `abcd efgh ijkl mnop` |

### ⚠️ IMPORTANT: Gmail app password

For Gmail you do **NOT** use your normal password! You must generate a special **"App Password"**:

1. Go to: **https://myaccount.google.com**
2. Click **"Security"**
3. Enable **"2-Step Verification"** if not already enabled
4. Search for **"App passwords"**
5. Select **"Mail"** and **"Windows Computer"** from the dropdowns
6. Click **"Generate"**
7. Copy the generated password (16 characters) and paste it into `accounts.csv`

### How to add a new SMTP account (via app):
1. In the app click the **account/settings** icon in the sidebar
2. Enter the SMTP server details
3. You can test the connection by clicking the **"Test"** button

### Other mail providers:

| Provider | smtp_server | smtp_port |
|---------|------------|----------|
| Gmail | `smtp.gmail.com` | `587` |
| Outlook/Hotmail | `smtp.office365.com` | `587` |
| Yahoo | `smtp.mail.yahoo.com` | `587` |
| Custom domain | ask your hosting provider | usually `587` |

---

## 9. OpenAI key (for AI email improvement)

The app can automatically **improve and format** email content using AI.  
This requires an API key from OpenAI.

### Where to put the key:

File: `coldmail-app/.env.local`

```
OPENAI_API_KEY=paste_your_key_here
```

### How to get an OpenAI key:
1. Go to: **https://platform.openai.com**
2. Create an account or log in
3. Click your account (top right) → **"API Keys"**
4. Click **"Create new secret key"**
5. Copy the key – it looks like: `sk-proj-aBcDeFgH...`
6. Paste it into `.env.local`:
```
OPENAI_API_KEY=sk-proj-yourkey
```
7. Save the file
8. **Restart the app** (close terminal, reopen it, type `npm run dev`)

> 💡 **Note:** OpenAI API usage is paid (very cheap, a few cents per email).  
> You can also leave `OPENAI_API_KEY=TODO` – the AI improvement feature won't work, but everything else will.

---

## 10. General app usage

### Navigating the app

After opening `http://localhost:3000` you'll see a left-side menu. Click on each section:

| Section (PL / EN) | What it does |
|---------|-------------|
| **Wyślij mail** / **Send Mail** | Write and send a new email |
| **Zaplanowane** / **Scheduled** | View and manage scheduled emails |
| **Lista kontaktów** / **Contacts** | Manage your contact list |
| **Linki** / **Links** | Manage website links |
| **Historia** / **History** | History of sent emails |

---

### How to write and send an email:

1. Click **"Wyślij mail"** in the left menu
2. In the **"To"** field type the recipient's address or pick from the contact list
3. Enter the **subject** in the Subject field
4. Write the **email body**
5. (Optional) Add attachments by dragging files onto the field or clicking "Add attachment" (max 15 MB total)
6. (Optional) Click the **"Improve"** button to let AI polish the content
7. Click **"Wyślij mail"** to send immediately, or **"Zaplanuj wysyłkę"** to schedule for later
8. Select the **account** you want to send from
9. (If scheduling) Choose the **date and time** for sending
9. Confirm the send

---

### How to check sent email history:

1. Click **"Historia"** in the menu
2. You'll see a list of all sent emails with date, recipient, and status
3. All logs are also saved to `data_source/sent_mails.csv`

---

## 11. Scheduled email sending

You can schedule emails to be sent automatically at a future date and time.

### How to schedule an email:

1. Click **"Wyślij mail"** in the menu
2. Fill in recipients, subject, and content as usual
3. Click the **"Zaplanuj wysyłkę"** button (instead of "Wyślij mail")
4. In the dialog, select the **SMTP account** and the **date and time** for sending
5. Click **"Zaplanuj"** to confirm

### How scheduled sending works:

- Scheduled emails are saved in `data_source/emails_to_sent.csv`
- **When the app starts**, it automatically checks for emails that are due and sends them
- To make sends look **natural**, emails are sent in **random 1-3 hour intervals** (not all at once)
- You can view, manage, and delete scheduled emails on the **"Zaplanowane"** page
- You can also manually trigger processing by clicking **"Wyślij zaległe teraz"** on the Zaplanowane page

> ⚠️ **Important:** The app must be running (`npm run dev`) for scheduled emails to be processed.  
> Emails are checked and sent when the app loads in the browser.

### File format (`emails_to_sent.csv`):
```
id,to,from_account,subject,html,scheduled_date,status,created_at,next_send_after
```

> ⚠️ **Warning:** Do not manually edit this file unless you know what you're doing.

---

## 12. Dark/Light mode and language

The app supports **dark and light mode** as well as **Polish (PL) and English (ENG)** interface language.

### How to switch:

1. Look at the **top of the left sidebar**, below the ColdMail logo
2. You'll see two small buttons:
   - **☀ Jasny / 🌙 Ciemny** – click to switch between light and dark mode
   - **🌐 ENG / PL** – click to switch the interface language
3. Your choice is **saved automatically** – it will be remembered next time you open the app

> 💡 **Tip:** All text in the app (buttons, labels, messages, errors) changes when you switch the language.

---

## 13. Shutting down the app

When you are done working:

1. Go back to the terminal window
2. Press **Ctrl+C** on the keyboard
3. The terminal may ask `Terminate batch job (Y/N)?` – type `Y` and press **Enter**
4. The app is shut down ✅
5. You can close the terminal

---

## 🔁 Quick cheatsheet – daily routine

```
1. Open folder: ColdMail → coldmail-app
2. Click in the address bar, type "cmd", press Enter
3. In the terminal type: npm run dev
4. Wait for the "Ready" message
5. Open the browser and go to: http://localhost:3000
6. Use the app!
7. When done: go to the terminal, press Ctrl+C
```

---

## 📁 Configuration file map

```
📁 coldmail-app\
├── .env.local              ← OpenAI API key
└── data_source\
    ├── accounts.csv        ← SMTP accounts (sending mailboxes)
    ├── brands.csv          ← Contact list (recipients)
    ├── emails_to_sent.csv  ← Scheduled emails queue
    ├── links.csv           ← Website links
    └── sent_mails.csv      ← Sent email history (auto-generated)
```

---

# 🛠️ For Developers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Email sending | [Nodemailer](https://nodemailer.com/) |
| AI improvement | OpenAI Chat Completions API (`gpt-5-mini`) |
| Data storage | CSV files via `csv-parse` / `csv-stringify` |
| Icons | `lucide-react` |

---

## Project Structure

```
coldmail-app/
├── data.ts                        # All CSV read/write logic (data layer)
├── data_source/                   # Flat-file "database"
│   ├── accounts.csv               # SMTP credentials
│   ├── brands.csv                 # Recipient contacts
│   ├── emails_to_sent.csv         # Scheduled email queue
│   ├── links.csv                  # Reusable website links
│   └── sent_mails.csv             # Append-only email log
├── src/
│   ├── app/
│   │   ├── globals.css            # Global styles with dark & light theme CSS variables
│   │   ├── layout.tsx             # Root layout (Sidebar + ThemeLanguageProvider)
│   │   ├── page.tsx               # Dashboard page
│   │   ├── compose/page.tsx       # Main compose UI + schedule button
│   │   ├── scheduled/page.tsx     # Scheduled email management page
│   │   ├── brands/page.tsx        # Brand/contact management
│   │   ├── links/page.tsx         # Link management
│   │   ├── logs/page.tsx          # Sent mail history
│   │   └── api/
│   │       ├── send-email/        # POST: send email via Nodemailer
│   │       ├── schedule-email/    # POST: schedule email for future sending
│   │       ├── scheduled-emails/  # GET: list / DELETE: remove scheduled emails
│   │       ├── process-scheduled/ # POST: process due emails with 1-3h delays
│   │       ├── improve-email/     # POST: improve content via OpenAI
│   │       ├── accounts/          # GET/POST/DELETE SMTP accounts
│   │       │   ├── test/          # POST: verify SMTP connection (new credentials)
│   │       │   └── test-existing/ # POST: test a saved account by username
│   │       ├── brands/            # GET/POST/DELETE brands
│   │       ├── links/             # GET/POST/DELETE links
│   │       └── logs/              # GET email send logs
│   ├── components/
│   │   ├── Sidebar.tsx                  # Navigation sidebar + theme/lang toggles
│   │   ├── ThemeLanguageProvider.tsx     # Context provider for dark/light & PL/EN
│   │   └── ScheduledEmailProcessor.tsx  # Startup check for due emails
│   └── lib/
│       └── translations.ts              # PL/EN translation dictionary
└── .env.local                     # Environment variables (gitignored)
```

---

## Setup

```bash
# Install dependencies
npm install

# Create environment file
echo OPENAI_API_KEY=sk-... > .env.local

# Start dev server
npm run dev

# Build for production
npm run build
npm start
```

---

## Environment Variables

Create a `.env.local` file in the `coldmail-app` root:

```env
# Required for AI email improvement
OPENAI_API_KEY=sk-proj-...

# Optional: fallback SMTP credentials (used if no account is selected in the UI)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@gmail.com
SMTP_PASSWORD=your_app_password
```

> The app works without any env vars. SMTP accounts are managed through the UI and stored in `data_source/accounts.csv`. `OPENAI_API_KEY` only disables the AI improve button if missing.

---

## Data Layer (`data.ts`)

All CSV I/O goes through `data.ts`. It resolves paths relative to `process.cwd()`, so `data_source/` must exist inside wherever `next dev` / `next start` is invoked (i.e. the `coldmail-app/` folder).

```ts
const DATA_DIR = path.join(process.cwd(), 'data_source');
```

### Interfaces

```ts
interface Brand   { name: string; email: string; }
interface Link    { 'website name': string; url: string; }
interface Account { smtp_server: string; smtp_port: string; smtp_username: string; smtp_password: string; }
interface EmailLog {
  id: string; to: string; from: string; subject: string;
  content: string; status: 'sent' | 'failed'; sentAt: string;
  files?: string[]; error?: string;
}
interface ScheduledEmail {
  id: string; to: string; from_account: string; subject: string;
  html: string; scheduled_date: string; status: 'pending' | 'sent' | 'failed';
  created_at: string; next_send_after?: string;
}
```

### Functions

| Function | Description |
|----------|-------------|
| `getBrands()` | Read all contacts from `brands.csv` |
| `saveBrands(brands)` | Overwrite `brands.csv` |
| `getLinks()` | Read all links from `links.csv` |
| `saveLinks(links)` | Overwrite `links.csv` |
| `getAccounts()` | Read SMTP accounts from `accounts.csv` |
| `saveAccounts(accounts)` | Overwrite `accounts.csv` |
| `getEmailLogs()` | Read all rows from `sent_mails.csv` |
| `getScheduledEmails()` | Read all rows from `emails_to_sent.csv` |
| `saveScheduledEmail(email)` | **Append** one row to `emails_to_sent.csv` |
| `updateScheduledEmailStatus(id, status)` | Update status of a scheduled email |
| `updateScheduledEmailNextSend(id, time)` | Set `next_send_after` for natural delay |
| `deleteScheduledEmail(id)` | Remove a scheduled email from CSV |
| `saveEmailLog(log)` | **Append** one row to `sent_mails.csv` (creates file + header if missing) |

---

## API Routes

### `POST /api/send-email`

Sends an email via Nodemailer.

**Request body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Subject line",
  "html": "<p>Body HTML</p>",
  "text": "Plain text fallback",
  "fromAccount": { "smtp_username": "sender@gmail.com" },
  "attachments": [
    { "filename": "file.pdf", "content": "<base64>", "contentType": "application/pdf" }
  ]
}
```

- `fromAccount.smtp_username` looks up full credentials from `accounts.csv`. Falls back to `SMTP_*` env vars if not matched.
- Attachments are base64-encoded by the client and decoded server-side into `Buffer`.
- After a successful send, calls `saveEmailLog()` to append to `sent_mails.csv`.
- Max attachment size is enforced client-side at **15 MB total**.

---

### `POST /api/improve-email`

Improves email content via OpenAI.

**Request body:**
```json
{
  "content": "Raw email HTML or text",
  "instructions": "Optional style instructions"
}
```

**Response:**
```json
{ "improved": "<p>Improved HTML content</p>" }
```

- Uses model `gpt-5-mini` with `temperature: 1` and `max_completion_tokens: 20000`.
- System prompt instructs the model to return only improved HTML with no commentary.
- Placeholders like `{{name}}`, `{{company}}` are preserved.
- Returns HTTP 500 if `OPENAI_API_KEY` is not set.

---

### `GET /api/accounts`

Returns all saved accounts **without passwords** (safe for client display).

### `POST /api/accounts`

Adds a new SMTP account. Returns 409 if the username already exists.

### `DELETE /api/accounts`

Deletes an account by `smtp_username`.

### `POST /api/accounts/test`

Verifies an SMTP connection using `nodemailer.verify()`. Accepts full credentials in the request body.  
Connection/greeting timeout: **8 seconds**.

### `POST /api/accounts/test-existing`

Same as `test` but looks up credentials from `accounts.csv` by username – password is never sent from the client.

---

### `POST /api/schedule-email`

Saves one or more emails for future sending.

**Request body:**
```json
{
  "to": "recipient@example.com, another@example.com",
  "from_account": "sender@gmail.com",
  "subject": "Subject line",
  "html": "<p>Body HTML</p>",
  "scheduled_date": "2026-03-01T10:00:00.000Z"
}
```

- Multiple recipients (comma-separated) are split into individual scheduled emails.
- Each email gets a unique UUID and `status: pending`.

---

### `GET /api/scheduled-emails`

Returns all scheduled emails from `emails_to_sent.csv`.

### `DELETE /api/scheduled-emails`

Deletes a scheduled email by `id`.

---

### `POST /api/process-scheduled`

Processes due scheduled emails with natural delays.

- Finds all `pending` emails where `scheduled_date <= now`
- Sends the first eligible email via SMTP (with `{{name}}` personalization)
- Assigns a random **1-3 hour** `next_send_after` to the next email in queue
- Stops processing until the delay expires
- Returns: `{ processed, sent, failed, remaining }`

This endpoint is called automatically on app startup via `ScheduledEmailProcessor`.

---

### `GET/POST/DELETE /api/brands`

Standard CRUD for contacts in `brands.csv`.

### `GET/POST/DELETE /api/links`

Standard CRUD for links in `links.csv`.

### `GET /api/logs`

Returns all rows from `sent_mails.csv`. The `files` column is stored as a JSON string and parsed back to an array on read.

---

## SMTP Configuration Notes

- Port **587** → STARTTLS (`secure: false`)
- Port **465** → implicit SSL (`secure: true`)

Port detection is automatic:

```ts
secure: Number(smtp_port) === 465
```

For Gmail, users must generate an [App Password](https://support.google.com/accounts/answer/185833) (requires 2FA).

---

## Client-side Notes

- Selected SMTP account is persisted in `localStorage` under the key `selectedAccount`.
- Theme preference is persisted in `localStorage` under `coldmail-theme` (`'dark'` or `'light'`).
- Language preference is persisted in `localStorage` under `coldmail-lang` (`'pl'` or `'en'`).
- The `ThemeLanguageProvider` wraps the entire app and provides `useSettings()` hook with `theme`, `lang`, `toggleTheme()`, `setLang()`, and `t(key)` for translations.
- All pages are `'use client'` components that use `t()` for all UI strings.
- Light mode is achieved via a `[data-theme="light"]` CSS variable override on `<html>`.

---

## Extending the App

To add a new data entity:

1. Add a new interface and read/write functions to `data.ts`
2. Create the CSV file in `data_source/`
3. Add an API route at `src/app/api/<resource>/route.ts`
4. Add a page at `src/app/<resource>/page.tsx`
5. Add a nav link to `src/components/Sidebar.tsx`
