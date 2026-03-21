-- ============================================
-- VEKO — Migration complète (safe, IF NOT EXISTS)
-- Copiez-collez ce script entier dans l'éditeur SQL de Supabase
-- et cliquez sur "Run"
-- ============================================

-- 1. Colonnes manquantes sur profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username            text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prenom              text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nom                 text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS indicatif           text DEFAULT '+237';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telephone           text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at          timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nom_boutique        text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS devise              text DEFAULT 'FCFA';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type       text DEFAULT 'social';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pub_enabled         boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS livraison_enabled   boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loyer_enabled       boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_connected   boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_store_url   text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_orders_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_revenue     numeric DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_last_sync   timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_access_token text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS checklist_hidden    boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_sale_done     boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_product_done  boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS objective_set       boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_level          text DEFAULT 'starter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_points           integer DEFAULT 0;

-- 2. Colonnes manquantes sur ventes
ALTER TABLE ventes ADD COLUMN IF NOT EXISTS source            text DEFAULT 'manual';
ALTER TABLE ventes ADD COLUMN IF NOT EXISTS shopify_order_id  text;
ALTER TABLE ventes ADD COLUMN IF NOT EXISTS shopify_status    text DEFAULT 'pending';
ALTER TABLE ventes ADD COLUMN IF NOT EXISTS shopify_note      text;

-- 3. Colonnes manquantes sur produits
ALTER TABLE produits ADD COLUMN IF NOT EXISTS frais_transport numeric DEFAULT 0;
ALTER TABLE produits ADD COLUMN IF NOT EXISTS nb_articles     integer DEFAULT 0;

-- 4. Table goals (si inexistante)
CREATE TABLE IF NOT EXISTS public.goals (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type         text NOT NULL CHECK (type IN ('revenue', 'net_profit', 'products_sold')),
  target_value numeric(12,2) NOT NULL,
  start_date   date NOT NULL,
  end_date     date NOT NULL,
  created_at   timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'goals_own'
  ) THEN
    CREATE POLICY "goals_own" ON public.goals FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Table labo_history (si inexistante)
CREATE TABLE IF NOT EXISTS public.labo_history (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom_produit text NOT NULL DEFAULT '',
  data        jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.labo_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'labo_history' AND policyname = 'labo_history_own'
  ) THEN
    CREATE POLICY "labo_history_own" ON public.labo_history FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. Table charges_mensuelles (si inexistante)
CREATE TABLE IF NOT EXISTS public.charges_mensuelles (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mois             text NOT NULL,
  nom              text NOT NULL,
  icone            text NOT NULL DEFAULT '📝',
  categorie        text NOT NULL DEFAULT 'urgent',
  montant_total    numeric NOT NULL DEFAULT 0,
  montant_couvert  numeric NOT NULL DEFAULT 0,
  jour_echeance    integer NOT NULL DEFAULT 1,
  est_paye         boolean DEFAULT false,
  paye_le          timestamptz,
  en_pause         boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.charges_mensuelles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'charges_mensuelles' AND policyname = 'charges_own'
  ) THEN
    CREATE POLICY "charges_own" ON public.charges_mensuelles FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 7. Mettre à jour les username manquants depuis l'email
UPDATE profiles
SET username = (
  SELECT split_part(email, '@', 1)
  FROM auth.users
  WHERE auth.users.id = profiles.id
)
WHERE username IS NULL;
