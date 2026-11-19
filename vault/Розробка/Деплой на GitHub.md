---
tags: [dev, git, deploy]
---
# Деплой на GitHub

Репозиторій: [bsmap/bsmap](https://github.com/bsmap/bsmap), гілка `main`. На GitHub сторінка називається `index.html`.

## Як відправити нові зміни з `master`
```bash
git checkout gh-pages-update
git pull --ff-only origin main
git checkout master -- css js
git show master:bsmap.html > index.html
git add index.html css js
git commit -m "Опис змін"
git push origin gh-pages-update:main
git checkout master
```

`README.md` на GitHub окремий, для користувачів. Технічний README з `master` туди не копіюється.

## Перевірка після деплою
- Відкрити сайт і оновити через Ctrl+F5.
- Перевірити, що підвантажились `css/styles.css` і `js/*.js` (DevTools → Network).
- Консоль має бути без помилок; Leaflet підключено з SRI, тож неправильний хеш зламає карту.

Див. [[Git і гілки]], [[Журнал змін]].
