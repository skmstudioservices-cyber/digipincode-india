# LOCAL MACHINE — git repos inventory (from owner's PowerShell scan, 16 Sep 2026)

Owner ki Windows machine pe mile saare git repos (`.git` folders). Baad mein local cleanup + "GitHub as source of truth" workflow ke liye reference.

## Maps-related (yeh project)
| Path | Kyun hai | Cleanup plan |
|---|---|---|
| `C:\maps` | purani copy | archive/delete — GitHub `mapsnearme` repo is the source now |
| `C:\SKM\Projects\maps` | local worktree | delete after confirming GitHub has everything |
| `C:\SKM\Projects\maps\v3` | nested repo | delete after checking for uncommitted work |
| `C:\SKM\Projects\india-directory` | early directory experiment | compare with `digipincode-india` repo content, then delete |
| `C:\Users\subha\digipincode` | local copy | superseded by GitHub `digipincode-india` (main + antigravity-build) |

## Other projects (owner decision needed)
- `C:\SKM\onlineplaygames`
- `C:\SKM\Projects\skm-tools`
- `C:\Users\subha\Blogger Theme Update Extension`
- `C:\Users\subha\LibreChat`
- `C:\Users\subha\Documents\Codex\2026-08-27\...\examstatus`
- `C:\Users\subha\OneDrive\Desktop\Exam Status`
- `C:\Users\subha\OneDrive\Documents\GitHub\festival-wishes`
- `C:\Users\subha\OneDrive\Documents\Playground`

## Skip
- `C:\Users\subha\.codex\vendor_imports\skills` — tool internals, not a project.

## Future cleanup workflow (jab owner bole)
1. Har repo mein `git status` + `git log --oneline -5` + `git remote -v` check karo — uncommitted/unpushed work bacha kya
2. Jo GitHub pe hai (skmstudioservices-cyber) uska local folder delete karke fresh `git clone` karo
3. Jo GitHub pe nahi hai aur rakhna hai — GitHub pe private repo bana ke push karo
4. Baaki archive (zip) karke cold storage, ya delete
