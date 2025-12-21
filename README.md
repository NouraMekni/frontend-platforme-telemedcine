# Plateforme de Télémédecine — Frontend (React + Tailwind)

Ce dépôt contient une base frontend React + Vite + TailwindCSS pour une plateforme de télémédecine et suivi santé.

Fonctionnalités incluses :
- Landing page (Home)
- Auth mock (login/register) avec rôle (admin / medecin / patient)
- Dashboard Admin (Users, Stats)
- Dashboard Médecin (planning, patients) with specialty selector
- Dashboard Patient (prise de RDV, dossier médical placeholder)
- Routing fonctionnel avec React Router v6

Structure principale (src/) :

```
src/
 ┣ components/
 ┃ ┣ Navbar.jsx
 ┃ ┣ Footer.jsx
 ┃ ┣ SidebarAdmin.jsx
 ┃ ┣ AdminHeader.jsx
 ┃ ┣ UserTable.jsx
 ┃ ┣ StatsCard.jsx
 ┃ ┣ DashboardLayout.jsx
 ┣ pages/
 ┃ ┣ Home.jsx
 ┃ ┣ Login.jsx
 ┃ ┣ Register.jsx
 ┃ ┣ AdminDashboard.jsx
 ┃ ┣ MedecinDashboard.jsx
 ┃ ┣ PatientDashboard.jsx
 ┣ routes/
 ┃ ┣ AppRoutes.jsx
 ┣ contexts/
 ┃ ┣ AuthContext.jsx
 ┣ App.jsx
 ┣ index.js
```

Installation & lancement (Windows PowerShell) :

```powershell
cd "c:\Users\ASUS\Desktop\projet_dev"
npm install
npm run dev
```

Remarques :
- L'authentification est simulée (stockée en localStorage). À remplacer par l'intégration backend Spring Boot plus tard.
- Le style utilise TailwindCSS. Personnalisez `tailwind.config.cjs` pour adapter la palette.
- Recharts est utilisé pour une carte de statistiques.

Prochaines étapes recommandées : connecter les endpoints backend (Spring Boot), ajouter la validation et rôle côté serveur, ajouter tests et CI.
