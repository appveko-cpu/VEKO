-- =====================================================
-- VEKO - Schéma Supabase + Row Level Security (RLS)
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- =====================================================

-- ── 1. TABLE PROFILES (extension de auth.users) ────
CREATE TABLE IF NOT EXISTS profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username  text,
  prenom    text,
  nom       text,
  telephone text,
  indicatif text DEFAULT '+237',
  devise    text DEFAULT 'FCFA',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Crée automatiquement le profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (new.id, split_part(new.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 2. TABLE PRODUITS ──────────────────────────────
CREATE TABLE IF NOT EXISTS produits (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom           text NOT NULL,
  prix_revient  numeric NOT NULL DEFAULT 0,
  prix_vente    numeric NOT NULL DEFAULT 0,
  commission    numeric NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produits_own"
  ON produits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── 3. TABLE VENTES (commandes) ────────────────────
CREATE TABLE IF NOT EXISTS ventes (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date                 timestamptz DEFAULT now(),
  nom_client           text DEFAULT '',
  tel                  text DEFAULT '',
  produit              text DEFAULT '',
  nb_pieces            numeric NOT NULL DEFAULT 0,
  prix_vente           numeric NOT NULL DEFAULT 0,
  ca                   numeric NOT NULL DEFAULT 0,
  depenses             numeric NOT NULL DEFAULT 0,
  benefice             numeric NOT NULL DEFAULT 0,
  marge                numeric NOT NULL DEFAULT 0,
  budget_pub_provisoire boolean DEFAULT false,
  retournee            boolean DEFAULT false,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ventes_own"
  ON ventes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── RÉSUMÉ SÉCURITÉ ────────────────────────────────
-- RLS activé sur toutes les tables :
-- • Chaque utilisateur NE PEUT PAS voir les données des autres.
-- • Même en cas de bug côté client, la DB refuse tout accès non autorisé.
-- • auth.uid() est l'ID de l'utilisateur connecté, résolu côté serveur.

-- ── MIGRATION (si la table profiles existait déjà) ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS devise text DEFAULT 'FCFA';

-- ── MIGRATION ONBOARDING + NIVEAUX ──────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type text DEFAULT 'social';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pub_enabled boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS livraison_enabled boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loyer_enabled boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_connected boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_store_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_access_token text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_level text DEFAULT 'starter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_points integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS checklist_hidden boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_sale_done boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_product_done boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS objective_set boolean DEFAULT false;
