---
tags: [dev, git]
---
# Git і гілки

Локальний репозиторій має дві гілки з **різною історією**:

| Гілка | Звідки | Що містить |
|---|---|---|
| `master` | локальна робоча гілка | `bsmap.html`, `css/`, `js/`, `tests/`, технічний `README.md`, `.claude/launch.json` |
| `gh-pages-update` | збудована поверх `origin/main` | `index.html` (копія `bsmap.html`), `css/`, `js/`, README для користувачів |

Remote: `origin` → `https://github.com/bsmap/bsmap.git`, гілка `main`.

> [!warning] Ручна синхронізація
> Історії `master` і `main` не пов'язані. Щоб відправити нові зміни на GitHub, див. [[Деплой на GitHub]]. Варіант позбутися двох гілок записано в [[Беклог]].

## Резервні копії
`bak 1.zip` і `bak 2.zip` у корені проєкту ігноруються Git (`*.zip`).
