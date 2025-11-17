# Configuration AWS Cognito pour MorningHelper

## Vue d'ensemble

Amazon Cognito gérera l'authentification et stockera les attributs de profil basiques. Les données métier (settings, reminders, etc.) seront dans DynamoDB.

## Attributs Cognito à Configurer

### 1. Attributs Standards (Cognito Built-in)

Ces attributs sont natifs à Cognito :

```yaml
Attributs Standards Requis:
  - email (Required, Mutable)          # Email principal - OBLIGATOIRE
  - email_verified (boolean)           # Email vérifié ou non
  - name (Optional, Mutable)           # Nom complet ou prénom

Attributs Standards Optionnels:
  - given_name (Optional, Mutable)     # Prénom
  - family_name (Optional, Mutable)    # Nom de famille
  - locale (Optional, Mutable)         # Langue préférée (fr-FR, en-US)
  - zoneinfo (Optional, Mutable)       # Timezone (Europe/Paris)
  - picture (Optional, Mutable)        # URL photo de profil
  - phone_number (Optional, Mutable)   # Téléphone (pour 2FA futur)
  - phone_number_verified (boolean)    # Téléphone vérifié
```

### 2. Attributs Personnalisés (Custom Attributes)

Ces attributs spécifiques à MorningHelper :

```yaml
Custom Attributes:
  # Abonnement
  - custom:subscription_status         # String: trial|active|expired|cancelled
  - custom:subscription_expiry         # Number: Unix timestamp
  - custom:trial_start                 # Number: Unix timestamp
  - custom:trial_end                   # Number: Unix timestamp

  # Plateforme
  - custom:platform                    # String: ios|android|web
  - custom:app_version                 # String: 1.0.0

  # RGPD - Consentements (booléens stockés comme String: "true"/"false")
  - custom:gdpr_consent                # String: "true"/"false"
  - custom:gdpr_consent_date           # Number: Unix timestamp
  - custom:data_collection_consent     # String: "true"/"false"
  - custom:location_sharing_consent    # String: "true"/"false"
  - custom:ai_processing_consent       # String: "true"/"false"
  - custom:marketing_consent           # String: "true"/"false"

  # Métadonnées
  - custom:created_at                  # Number: Unix timestamp
  - custom:last_login                  # Number: Unix timestamp
  - custom:onboarding_completed        # String: "true"/"false"
```

**⚠️ Important sur les Custom Attributes :**
- Une fois créés, ils **ne peuvent pas être supprimés** (seulement marqués comme non utilisés)
- Leur type **ne peut pas être changé** après création
- Ils sont préfixés automatiquement par `custom:` par Cognito
- Taille max: 2048 caractères par attribut

## Configuration du User Pool

### 3. Configuration via AWS Console

#### Étape 1 : Créer le User Pool

```yaml
User Pool Name: morninghelper-users-prod

Sign-in Options:
  - Email address ✓
  - Username ✗ (on utilise uniquement l'email)

MFA Configuration: Optional
  - SMS (pour le futur)
  - TOTP (Google Authenticator)

Password Policy:
  Minimum length: 8 characters
  Require:
    - Uppercase letters ✓
    - Lowercase letters ✓
    - Numbers ✓
    - Special characters ✓

Account Recovery:
  - Email recovery ✓
  - Phone recovery ✗ (futur)
```

#### Étape 2 : Configurer les Attributs

**Standard Attributes:**
```yaml
Required at Sign-up:
  - email ✓ (required, mutable)
  - name ✗ (optional, mutable)

Optional but Recommended:
  - locale (mutable)
  - zoneinfo (mutable)
```

**Custom Attributes (à créer):**
```yaml
Custom Attributes:
  1. subscription_status
     Type: String
     Min length: 1
     Max length: 20
     Mutable: Yes

  2. subscription_expiry
     Type: Number
     Min value: 0
     Max value: 9999999999999
     Mutable: Yes

  3. trial_start
     Type: Number
     Mutable: Yes

  4. trial_end
     Type: Number
     Mutable: Yes

  5. platform
     Type: String
     Max length: 10
     Mutable: Yes

  6. app_version
     Type: String
     Max length: 20
     Mutable: Yes

  7. gdpr_consent
     Type: String
     Max length: 5  # "true" or "false"
     Mutable: Yes

  8. gdpr_consent_date
     Type: Number
     Mutable: Yes

  9. data_collection_consent
     Type: String
     Max length: 5
     Mutable: Yes

  10. location_sharing_consent
      Type: String
      Max length: 5
      Mutable: Yes

  11. ai_processing_consent
      Type: String
      Max length: 5
      Mutable: Yes

  12. marketing_consent
      Type: String
      Max length: 5
      Mutable: Yes

  13. created_at
      Type: Number
      Mutable: No  # Immutable

  14. last_login
      Type: Number
      Mutable: Yes

  15. onboarding_completed
      Type: String
      Max length: 5
      Mutable: Yes
```

#### Étape 3 : App Clients

```yaml
App Client Name: morninghelper-mobile

Authentication flows:
  - ALLOW_USER_PASSWORD_AUTH ✓
  - ALLOW_REFRESH_TOKEN_AUTH ✓
  - ALLOW_USER_SRP_AUTH ✓

Token Expiration:
  - Access Token: 1 hour
  - ID Token: 1 hour
  - Refresh Token: 30 days

Read Attributes: ALL (cocher tous)
Write Attributes: ALL (cocher tous)

Security:
  - Prevent user existence errors ✓
  - Enable token revocation ✓
```

#### Étape 4 : Triggers (Lambda)

```yaml
Triggers to Configure:

Pre Sign-up:
  Function: PreSignUpTrigger
  Purpose: Auto-confirm email, set default attributes

Post Confirmation:
  Function: PostConfirmationTrigger
  Purpose: Create DynamoDB user record, send welcome email

Pre Authentication:
  Function: PreAuthenticationTrigger
  Purpose: Check subscription status

Post Authentication:
  Function: PostAuthenticationTrigger
  Purpose: Update last_login, log analytics

Pre Token Generation:
  Function: PreTokenGenerationTrigger
  Purpose: Add custom claims to JWT token
```

## Configuration CloudFormation / CDK

### CloudFormation Template (YAML)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'MorningHelper - Cognito User Pool'

Resources:
  MorningHelperUserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      UserPoolName: morninghelper-users-prod

      # Sign-in configuration
      UsernameAttributes:
        - email
      AutoVerifiedAttributes:
        - email

      # Standard attributes
      Schema:
        - Name: email
          AttributeDataType: String
          Required: true
          Mutable: true
        - Name: name
          AttributeDataType: String
          Required: false
          Mutable: true
        - Name: locale
          AttributeDataType: String
          Required: false
          Mutable: true
        - Name: zoneinfo
          AttributeDataType: String
          Required: false
          Mutable: true

        # Custom attributes - Subscription
        - Name: subscription_status
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MinLength: 1
            MaxLength: 20
        - Name: subscription_expiry
          AttributeDataType: Number
          Mutable: true
          NumberAttributeConstraints:
            MinValue: 0
        - Name: trial_start
          AttributeDataType: Number
          Mutable: true
        - Name: trial_end
          AttributeDataType: Number
          Mutable: true

        # Custom attributes - Platform
        - Name: platform
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MaxLength: 10
        - Name: app_version
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MaxLength: 20

        # Custom attributes - GDPR
        - Name: gdpr_consent
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MaxLength: 5
        - Name: gdpr_consent_date
          AttributeDataType: Number
          Mutable: true
        - Name: data_collection_consent
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MaxLength: 5
        - Name: location_sharing_consent
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MaxLength: 5
        - Name: ai_processing_consent
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MaxLength: 5
        - Name: marketing_consent
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MaxLength: 5

        # Custom attributes - Metadata
        - Name: created_at
          AttributeDataType: Number
          Mutable: false  # Immutable
        - Name: last_login
          AttributeDataType: Number
          Mutable: true
        - Name: onboarding_completed
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MaxLength: 5

      # Password policy
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireUppercase: true
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: true
          TemporaryPasswordValidityDays: 7

      # Email configuration
      EmailConfiguration:
        EmailSendingAccount: COGNITO_DEFAULT  # Ou SES si volume élevé

      # MFA configuration
      MfaConfiguration: OPTIONAL
      EnabledMfas:
        - SOFTWARE_TOKEN_MFA

      # Account recovery
      AccountRecoverySetting:
        RecoveryMechanisms:
          - Name: verified_email
            Priority: 1

      # Tags
      UserPoolTags:
        Environment: production
        Application: MorningHelper

  MorningHelperUserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      ClientName: morninghelper-mobile
      UserPoolId: !Ref MorningHelperUserPool

      # Auth flows
      ExplicitAuthFlows:
        - ALLOW_USER_PASSWORD_AUTH
        - ALLOW_REFRESH_TOKEN_AUTH
        - ALLOW_USER_SRP_AUTH

      # Token validity
      AccessTokenValidity: 1
      IdTokenValidity: 1
      RefreshTokenValidity: 30
      TokenValidityUnits:
        AccessToken: hours
        IdToken: hours
        RefreshToken: days

      # Attributes
      ReadAttributes:
        - email
        - email_verified
        - name
        - locale
        - zoneinfo
        - custom:subscription_status
        - custom:subscription_expiry
        - custom:trial_start
        - custom:trial_end
        - custom:platform
        - custom:app_version
        - custom:gdpr_consent
        - custom:gdpr_consent_date
        - custom:data_collection_consent
        - custom:location_sharing_consent
        - custom:ai_processing_consent
        - custom:marketing_consent
        - custom:created_at
        - custom:last_login
        - custom:onboarding_completed

      WriteAttributes:
        - email
        - name
        - locale
        - zoneinfo
        - custom:subscription_status
        - custom:subscription_expiry
        - custom:trial_start
        - custom:trial_end
        - custom:platform
        - custom:app_version
        - custom:gdpr_consent
        - custom:gdpr_consent_date
        - custom:data_collection_consent
        - custom:location_sharing_consent
        - custom:ai_processing_consent
        - custom:marketing_consent
        - custom:last_login
        - custom:onboarding_completed

      # Security
      PreventUserExistenceErrors: ENABLED
      EnableTokenRevocation: true

Outputs:
  UserPoolId:
    Description: Cognito User Pool ID
    Value: !Ref MorningHelperUserPool
    Export:
      Name: MorningHelperUserPoolId

  UserPoolClientId:
    Description: Cognito User Pool Client ID
    Value: !Ref MorningHelperUserPoolClient
    Export:
      Name: MorningHelperUserPoolClientId

  UserPoolArn:
    Description: Cognito User Pool ARN
    Value: !GetAtt MorningHelperUserPool.Arn
```

## Utilisation dans l'Application React Native

### Configuration dans le code

```typescript
// src/infrastructure/backend/auth/cognito-config.ts
import { ENV } from '@/shared/config/env';

export const cognitoConfig = {
  region: ENV.AWS_REGION,
  userPoolId: ENV.AWS_COGNITO_USER_POOL_ID,
  userPoolClientId: ENV.AWS_COGNITO_CLIENT_ID,
};

// Attributs personnalisés à lire/écrire
export const COGNITO_CUSTOM_ATTRIBUTES = {
  SUBSCRIPTION_STATUS: 'custom:subscription_status',
  SUBSCRIPTION_EXPIRY: 'custom:subscription_expiry',
  TRIAL_START: 'custom:trial_start',
  TRIAL_END: 'custom:trial_end',
  PLATFORM: 'custom:platform',
  APP_VERSION: 'custom:app_version',
  GDPR_CONSENT: 'custom:gdpr_consent',
  GDPR_CONSENT_DATE: 'custom:gdpr_consent_date',
  DATA_COLLECTION_CONSENT: 'custom:data_collection_consent',
  LOCATION_SHARING_CONSENT: 'custom:location_sharing_consent',
  AI_PROCESSING_CONSENT: 'custom:ai_processing_consent',
  MARKETING_CONSENT: 'custom:marketing_consent',
  CREATED_AT: 'custom:created_at',
  LAST_LOGIN: 'custom:last_login',
  ONBOARDING_COMPLETED: 'custom:onboarding_completed',
} as const;
```

### Exemple Sign-Up avec attributs

```typescript
// src/infrastructure/backend/auth/CognitoAuthService.ts
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

async signUp(email: string, password: string, platform: 'ios' | 'android' | 'web') {
  const attributeList = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    }),
    new CognitoUserAttribute({
      Name: 'custom:platform',
      Value: platform,
    }),
    new CognitoUserAttribute({
      Name: 'custom:created_at',
      Value: Date.now().toString(),
    }),
    new CognitoUserAttribute({
      Name: 'custom:subscription_status',
      Value: 'trial',
    }),
    new CognitoUserAttribute({
      Name: 'custom:trial_start',
      Value: Date.now().toString(),
    }),
    new CognitoUserAttribute({
      Name: 'custom:trial_end',
      Value: (Date.now() + 30 * 24 * 60 * 60 * 1000).toString(), // +30 jours
    }),
    new CognitoUserAttribute({
      Name: 'custom:onboarding_completed',
      Value: 'false',
    }),
  ];

  // ... reste du code sign-up
}
```

## Bonnes Pratiques

### 1. Séparation des Responsabilités

```
Cognito (Profil & Auth):
  ✓ Email, nom, locale
  ✓ Statut abonnement
  ✓ Consentements RGPD
  ✓ Métadonnées basiques

DynamoDB (Données Métier):
  ✓ UserSettings (température, localisation, etc.)
  ✓ Reminders (rappels personnalisés)
  ✓ Historique des suggestions
  ✓ Préférences détaillées
```

### 2. Synchronisation Cognito ↔ DynamoDB

Utiliser un Lambda Trigger **Post Confirmation** :

```javascript
// Lambda PostConfirmationTrigger
exports.handler = async (event) => {
  const { userName, request } = event;
  const userAttributes = request.userAttributes;

  // Créer l'enregistrement DynamoDB
  await dynamodb.put({
    TableName: 'Users',
    Item: {
      userId: userName,
      email: userAttributes.email,
      subscriptionStatus: userAttributes['custom:subscription_status'],
      createdAt: new Date().toISOString(),
      // ... autres attributs
    },
  });

  return event;
};
```

### 3. Sécurité

- ✅ Activer **PreventUserExistenceErrors**
- ✅ Utiliser **SRP** (Secure Remote Password) pour l'auth
- ✅ Token refresh pour limiter la durée des tokens
- ✅ MFA optionnel dès le début (pour upgrade futur)

### 4. RGPD

- ✅ Stocker les consentements dans Cognito
- ✅ Permettre la modification des consentements
- ✅ Export des données = Cognito attributes + DynamoDB data
- ✅ Suppression compte = Delete Cognito user + Lambda trigger pour cleanup DynamoDB

## Coûts Estimés

```
Cognito Pricing (eu-west-1):
  - 50,000 premiers MAU : GRATUIT
  - MAU supplémentaires : $0.0055/MAU

Exemple pour 1,000 utilisateurs actifs/mois:
  - Coût: $0 (dans les 50k gratuits)

Exemple pour 100,000 utilisateurs actifs/mois:
  - 50,000 gratuits
  - 50,000 × $0.0055 = $275/mois
```

## Checklist de Déploiement

- [ ] Créer le User Pool avec tous les attributs
- [ ] Créer l'App Client
- [ ] Noter les IDs (User Pool ID, Client ID)
- [ ] Ajouter les IDs dans `.env`
- [ ] Créer les Lambda Triggers
- [ ] Configurer les permissions IAM pour les Lambdas
- [ ] Tester sign-up en dev
- [ ] Tester sign-in en dev
- [ ] Tester récupération de mot de passe
- [ ] Vérifier que les attributs sont bien stockés
- [ ] Tester la synchronisation avec DynamoDB

## Ressources

- [Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Cognito Custom Attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)
- [amazon-cognito-identity-js](https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js)
- [AWS Amplify Auth](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)

---

**Prochaine étape** : Implémenter `CognitoAuthService.ts` avec ces attributs !
