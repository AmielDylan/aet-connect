// Bootstrap file pour configurer tsconfig-paths avant de charger l'app
const path = require('path')
const tsConfigPaths = require('tsconfig-paths')

// Le baseUrl doit pointer vers la racine du projet (où se trouve tsconfig.json)
// car les paths dans tsconfig.json sont relatifs à baseUrl
const baseUrl = path.resolve(__dirname)

// Enregistrer les paths depuis tsconfig.json
// Les paths doivent pointer vers dist/ car c'est là que sont les fichiers compilés
tsConfigPaths.register({
  baseUrl: baseUrl,
  paths: {
    '@/*': ['dist/*']
  }
})

// Charger l'application après avoir configuré les paths
require('./dist/app.js')

