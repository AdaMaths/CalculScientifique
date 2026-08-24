// ============================================================
// CalculLAB — Supabase client (optionnel)
// ------------------------------------------------------------
// Ce projet fonctionne entièrement en local / statique sans Supabase.
// Active-le seulement si tu veux : sauvegarder des résultats,
// gérer des comptes utilisateurs, ou stocker des jeux de données.
//
// 1. Ajoute dans index.html, avant js/app.js :
//    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// 2. Renseigne les valeurs ci-dessous (Project Settings > API sur supabase.com)
// 3. Ne commite JAMAIS ta clé "service_role" — seule la clé "anon public" a sa place ici.
// ============================================================

const SUPABASE_URL = '';       // ex: 'https://xxxxxxxx.supabase.co'
const SUPABASE_ANON_KEY = '';  // clé "anon public"

let supabaseClient = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.info('[CalculLAB] Supabase connecté.');
} else {
  console.info('[CalculLAB] Supabase non configuré — le site fonctionne en mode 100% statique.');
}
