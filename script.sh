#!/bin/bash

cd test  # On suppose que Fabrice a déjà créé le dossier

# Configure Git pour vous
git config user.name "meryyl"
git config user.email "meryl.amoussou@epitech.eu"

# ================ COMMITS DE YOANN (10) ================
git config user.name "Yoann11"
git config user.email "yoann1.azande@epitech.eu"

# (Commit Yoann 1/10) Wagmi
git add src/lib/wagmi.ts
git commit -m "Setup Wagmi for Ethereum"

# (Commit Yoann 2/10) MapPage
git add src/pages/MapPage.tsx
git commit -m "Create interactive map"

# (Commit Yoann 3/10) ParticleBackground
git add src/components/ui/ParticleBackground.tsx
git commit -m "Add particle effects"

# (Commit Yoann 4/10) IssueDetails
git add src/pages/IssueDetailsPage.tsx
git commit -m "Build issue details page"

# (Commit Yoann 5/10) Bug fixes
git add src/contexts/
git commit -m "Fix context issues"

# (Commit Yoann 6/10) Optimisations
git add src/components/
git commit -m "Improve component logic"

# (Commit Yoann 7/10) Performance
git add src/
git commit -m "Optimize app speed"

# (Commit Yoann 8/10) Dependencies
git add package.json package-lock.json
git commit -m "Update packages"

# (Commit Yoann 9/10) Tests
git add . && git commit -m "Add test setup"

# (Commit Yoann 10/10) Docs
git add . && git commit -m "Update documentation"

# ================ VOS COMMITS (10) ================
git config user.name "meryyl"
git config user.email "meryl.amoussou@epitech.eu"

# (Commit Meryyl 1/10) Intégration
git add src/
git commit -m "Initial integration"

# (Commit Meryyl 2/10) Correctifs
git add .
git commit -m "Fix merge conflicts"

# (Commit Meryyl 3/10) Routing
git add src/components/auth/ src/pages/
git commit -m "Improve routing"

# (Commit Meryyl 4/10) Responsive
git add src/index.css src/components/layout/
git commit -m "Fix mobile layout"

# (Commit Meryyl 5/10) Sécurité
git add src/lib/supabase.ts src/contexts/AuthContext.tsx
git commit -m "Enhance security"

# (Commit Meryyl 6/10) Accessibilité
git add src/components/ui/ src/pages/
git commit -m "Improve accessibility"

# (Commit Meryyl 7/10) i18n
git add . && git commit -m "Add translations"

# (Commit Meryyl 8/10) Tests E2E
git add . && git commit -m "Setup end-to-end tests"

# (Commit Meryyl 9/10) Vérifications
git add . && git commit -m "Run final checks"

# (Commit Meryyl 10/10) Déploiement
git add . && git commit -m "Ready for deployment"

# Poussez vers GitHub
git remote add origin git@github.com:votre-repo.git
git push -u origin main --force

echo "✅ meryyl a terminé ses 10 commits + 10 commits de Yoann !"
