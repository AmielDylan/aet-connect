# 🔧 Configuration Supabase - Migration vers Supabase Auth

## Scripts SQL à exécuter dans Supabase Dashboard > SQL Editor

### 1. S'assurer que la colonne id de users est UUID

```sql
-- Vérifier le type actuel
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- Si ce n'est pas UUID, convertir
ALTER TABLE users ALTER COLUMN id TYPE uuid USING id::uuid;
```

### 2. Créer une fonction trigger pour synchroniser auth.users et users

```sql
-- Fonction pour créer automatiquement un enregistrement dans users quand un user auth est créé
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insérer dans la table users quand un nouveau user auth est créé
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, new.created_at)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Mettre à jour les policies Storage avec auth.uid()

```sql
-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars publics" ON storage.objects;
DROP POLICY IF EXISTS "Upload avatar authentifié" ON storage.objects;
DROP POLICY IF EXISTS "Suppression avatar par propriétaire" ON storage.objects;

-- Upload par propriétaire uniquement
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Suppression par propriétaire uniquement
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update par propriétaire uniquement
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Lecture publique des avatars
CREATE POLICY "Public avatar read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### 4. Vérifier que le bucket avatars existe

```sql
-- Vérifier si le bucket existe
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Si le bucket n'existe pas, le créer
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

---

## ⚠️ IMPORTANT : Migration des utilisateurs existants

Si vous avez déjà des utilisateurs dans la table `users`, vous devez les migrer vers `auth.users`.

**ATTENTION** : Cette migration nécessite que les mots de passe soient déjà hashés avec bcrypt dans la colonne `password_hash` de la table `users`.

```sql
-- Script de migration (à exécuter UNE SEULE FOIS)
-- ⚠️  ATTENTION : Les utilisateurs devront réinitialiser leur mot de passe après cette migration

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT * FROM users WHERE id NOT IN (SELECT id FROM auth.users) LOOP
    -- Créer l'utilisateur dans auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      change_sent_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      confirmed_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_record.id,
      'authenticated',
      'authenticated',
      user_record.email,
      user_record.password_hash, -- Hash bcrypt existant
      NOW(), -- Confirmer l'email directement
      user_record.created_at,
      NOW(),
      '',
      '',
      '',
      '',
      NULL,
      NULL,
      NULL,
      NULL,
      '{}',
      '{}',
      false,
      NULL,
      NULL,
      '',
      '',
      NULL,
      NOW(),
      '',
      0,
      NULL,
      '',
      NULL,
      false,
      NULL
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;
```

**Après cette migration** :
- Les utilisateurs devront utiliser "Mot de passe oublié" pour réinitialiser leur mot de passe
- Ou vous pouvez créer un script pour générer des mots de passe temporaires

---

## ✅ Vérification

Après avoir exécuté les scripts :

1. Créer un nouvel utilisateur via l'interface
2. Vérifier qu'un enregistrement apparaît dans `auth.users`
3. Vérifier qu'un enregistrement apparaît dans `users` (grâce au trigger)
4. Tester l'upload d'avatar (les policies doivent fonctionner)



