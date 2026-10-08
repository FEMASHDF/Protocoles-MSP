# Protocoles MSP

Formulaire statique en français pour préparer une fiche d’identité et un protocole pluriprofessionnel en tableau QQOQPC (Qui, Quoi, Où, Quand, Pourquoi, Comment).

## Utilisation

Publier l’ensemble des fichiers avec GitHub Pages. La rédaction et les exports fonctionnent localement. L’envoi FEMAS utilise la connexion Microsoft et le flux Power Automate de CPOM OS ; aucun secret n’est placé dans le site.

Le parcours commence par le choix d’une **thématique** : filtre par catégorie de l’annexe 3 de l’ACI (plus « hors liste »), recherche par mot-clé. La thématique pré-remplit les professions, 6 étapes (repérer, évaluer, planifier, intervenir, suivre, alerter) avec des réponses proposées pour Qui / Quand / Comment, des pistes de références (à vérifier) et des indicateurs. Le catalogue est dans `themes.js` : pour ajouter ou modifier une thématique, éditer ce fichier.

Le parcours comporte ensuite une fiche d’identité enrichie (besoin, objectifs, population, équipe, références), les étapes de soins et un document automatiquement composé. Les lieux et objectifs généraux alimentent les cellules Où / Pourquoi lorsque l’étape ne les précise pas. Les autres informations manquantes apparaissent « À compléter » : aucune décision clinique n’est inventée.

Sauvegarde automatique dans le navigateur ; export/import JSON pour reprise ; impression PDF via le navigateur ; export HTML compatible Word avec extension `.doc` (ce fichier n’est pas un DOCX). L’exemple est fictif et ne doit pas être utilisé comme protocole clinique.

## Confidentialité

Les réponses restent dans le stockage local du navigateur jusqu’à un envoi volontaire à la FEMAS, après connexion Microsoft et confirmation du professionnel. Le flux dépose le document dans le dossier SharePoint « Protocoles pluripro » et crée une ligne dans « Suivi des protocoles pluripro ». Le statut « Reçu » confirme la réception, sans validation clinique. Ne pas saisir de données de patients. Sur un ordinateur partagé, exporter puis effacer le brouillon.

## Cadre et limites

Trame de rédaction, sans garantie automatique d’éligibilité ACI. Validation collective, actualité des recommandations, champ de compétences et modalités CPAM à vérifier par l’équipe. La date et les noms de validation sont déclaratifs. Ce formulaire ne crée pas de protocole de coopération avec transfert d’actes.

Les brouillons de la version 1 (schema 1) restent importables ; ils sont complétés automatiquement.

Sources consultées le 8 octobre 2026 :
- [ACI, avenant n° 2 approuvé le 8 juillet 2026](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000054399574/2026-08-18)
- [HAS, Comment élaborer et mettre en œuvre des protocoles pluriprofessionnels ?](https://www.has-sante.fr/jcms/c_2033014/fr/comment-elaborer-et-mettre-en-oeuvre-des-protocoles-pluriprofessionnels)

## Publication GitHub Pages

Dans les paramètres du dépôt : Pages → Deploy from a branch → main → / (root) → Save. Le retour de connexion Microsoft doit correspondre exactement à https://femashdf.github.io/Protocoles-MSP/. Bibliothèque Microsoft officielle MSAL Browser 5.24.0, licence fournie dans MSAL-LICENSE.txt. Le flux exige un compte du tenant FEMAS HDF. En cas de réception non confirmée, vérifier la liste SharePoint avant un nouvel envoi.
