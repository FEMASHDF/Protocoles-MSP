'use strict';
/* Catalogue des thématiques — FEMAS Hauts-de-France.
   Thèmes prioritaires : annexe 3 de l'ACI MSP (inchangée par l'avenant n° 2).
   Les suggestions sont organisationnelles : l'équipe les garde, les décoche ou les complète.
   Les références sont des pistes à vérifier (titre, date, actualité) avant d'être citées.
   Pour ajouter une thématique : ajouter un objet dans THEMES avec la catégorie (cat) voulue. */

const PROFS = [
  'Médecin généraliste', 'Infirmier(ère)', 'Infirmier(ère) en pratique avancée (IPA)', 'Pharmacien',
  'Masseur-kinésithérapeute', 'Sage-femme', 'Diététicien(ne)', 'Psychologue', 'Pédicure-podologue',
  'Orthophoniste', 'Ergothérapeute', 'Enseignant en activité physique adaptée', 'Chirurgien-dentiste',
  'Assistant(e) médical(e)', 'Coordinateur(trice)', 'Accueil / secrétariat'
];

const MODES = [
  'Dossier patient partagé (notes, alertes)', 'Messagerie sécurisée de santé', 'Réunion de concertation pluriprofessionnelle',
  'Échange direct (bureau, téléphone)', 'Courrier / lettre de liaison vers l’extérieur', 'Cahier de liaison au domicile'
];

const MG = 'Médecin généraliste', IDE = 'Infirmier(ère)', IPA = 'Infirmier(ère) en pratique avancée (IPA)', PH = 'Pharmacien',
  MK = 'Masseur-kinésithérapeute', SF = 'Sage-femme', DIET = 'Diététicien(ne)', PSY = 'Psychologue', POD = 'Pédicure-podologue',
  ORTHO = 'Orthophoniste', ERGO = 'Ergothérapeute', APA = 'Enseignant en activité physique adaptée', COORD = 'Coordinateur(trice)',
  ACC = 'Accueil / secrétariat', AM = 'Assistant(e) médical(e)';

/* Les 6 temps d'un parcours, communs à toutes les thématiques */
const STEP_KEYS = ['reperer', 'evaluer', 'planifier', 'intervenir', 'suivre', 'alerter'];
const STEP_COLORS = { reperer: '#1a8fcc', evaluer: '#4a4a92', planifier: '#3558a2', intervenir: '#cf3482', suivre: '#c98f00', alerter: '#3f9e83', libre: '#6b6d7c' };

const CATS = [
  { id: 'decomp', short: 'Affections sévères ou décompensées', label: 'Affections sévères compliquées ou décompensées', ex: 'Insuffisance cardiaque, BPCO, asthme instable, troubles psychiques graves' },
  { id: 'chron', short: 'Chroniques et désinsertion', label: 'Pathologies chroniques nécessitant des soins itératifs et prévention de la désinsertion socioprofessionnelle', ex: 'Lombalgies chroniques invalidantes, syndrome anxio-dépressif' },
  { id: 'iatro', short: 'Iatrogénie et équilibre thérapeutique', label: 'Risque iatrogénique ou équilibre thérapeutique nécessitant une intervention concertée', ex: 'AVK, insulinothérapie' },
  { id: 'domicile', short: 'Complexité et maintien à domicile', label: 'Patients complexes ou en perte d’autonomie : conforter le maintien à domicile', ex: 'Sujets âgés fragilisés, plaies chroniques, polypathologie, soins palliatifs, suivi post-AVC' },
  { id: 'obesite', short: 'Obésité', label: 'Patients obèses', ex: 'Adultes, enfants et adolescents' },
  { id: 'grossesse', short: 'Grossesses à risque', label: 'Grossesses à risque et grossesses en environnement psychosocial difficile', ex: 'Pathologie, antécédents, grossesse multiple, isolement, précarité, addictions' },
  { id: 'psychosocial', short: 'Troubles psychiques, social, maltraitance', label: 'Prise en charge complexifiée par des troubles psychiques, du comportement ou des difficultés sociales ; maltraitance intrafamiliale', ex: 'Précarité, troubles du comportement, violences intrafamiliales' },
  { id: 'hors', short: 'Hors liste', label: 'Thème hors annexe 3 (avis du service médical de l’Assurance Maladie)', ex: 'Sevrage tabagique, autre thème choisi par l’équipe', hors: true }
];

/* Trame d'étapes par catégorie : titre, action proposée, qui par défaut, suggestions Quand / Comment */
const TEMPLATES = {
  _base: {
    reperer: { t: 'Repérer et inclure', what: 'Identifier les patients relevant du protocole et leur proposer d’entrer dans le parcours.', who: [MG, IDE],
      when: ['Lors d’une consultation de suivi', 'À la sortie d’hospitalisation', 'Lors de la revue de la file active de l’équipe'],
      how: ['Critères d’inclusion validés par l’équipe', 'Information et accord du patient tracés dans le dossier', 'Signalement au référent du protocole'] },
    evaluer: { t: 'Évaluer la situation', what: 'Réaliser un bilan partagé de la situation du patient : santé, traitements, autonomie, environnement.', who: [MG, IDE],
      when: ['Dans le mois suivant l’inclusion', 'Lors d’une consultation dédiée'],
      how: ['Grille de bilan commune à l’équipe', 'Synthèse tracée dans le dossier partagé'] },
    planifier: { t: 'Construire le plan avec le patient', what: 'Définir avec le patient ses objectifs et le plan personnalisé de santé (PPS) : qui intervient, quand.', who: [MG, IDE],
      when: ['À l’issue du bilan', 'En réunion de concertation pluriprofessionnelle'],
      how: ['Plan personnalisé de santé (PPS) partagé', 'Objectifs choisis avec le patient', 'Désignation d’un professionnel référent pour le patient'] },
    intervenir: { t: 'Réaliser les interventions', what: 'Mettre en œuvre les interventions convenues par l’équipe, chacun dans son champ de compétences.', who: [IDE],
      when: ['Selon le calendrier du PPS'],
      how: ['Séances d’éducation thérapeutique', 'Transmission dans le dossier après chaque intervention'] },
    suivre: { t: 'Suivre et réajuster', what: 'Organiser le suivi coordonné et réajuster le plan si besoin.', who: [MG, IDE],
      when: ['Selon la fréquence fixée dans le PPS', 'Après chaque hospitalisation', 'Une fois par an au minimum'],
      how: ['Rappels programmés dans le logiciel partagé', 'Revue des dossiers en réunion de concertation', 'Mise à jour du PPS'] },
    alerter: { t: 'Gérer les alertes et orienter', what: 'Repérer les signes d’alerte définis par l’équipe et orienter sans délai.', who: [MG],
      when: ['Dès l’apparition d’un signe d’alerte', 'Le jour même'],
      how: ['Liste des signes d’alerte validée et remise au patient', 'Créneau de soins non programmés réservé', 'Courrier d’adressage vers le spécialiste ou l’hôpital'] }
  },
  decomp: {
    reperer: { what: 'Identifier les patients atteints d’une affection sévère (diagnostic connu, hospitalisation récente, décompensation) et leur proposer le parcours.', who: [MG, IDE, IPA, PH],
      when: ['À la sortie d’hospitalisation', 'Après une décompensation', 'Lors d’une consultation de suivi', 'Lors de la revue de la file active de l’équipe'],
      how: ['Requête dans le logiciel partagé', 'Lettre de liaison de sortie reçue et lue', 'Information et accord du patient tracés dans le dossier', 'Signalement au référent par messagerie sécurisée'] },
    evaluer: { what: 'Bilan partagé : sévérité, traitements et observance, éducation déjà reçue, environnement, aidants.', who: [MG, IDE, IPA, PH, MK],
      how: ['Grille de bilan commune à l’équipe', 'Bilan partagé de médication', 'Évaluation de l’observance', 'Synthèse tracée dans le dossier partagé'] },
    planifier: { how: ['Plan personnalisé de santé (PPS) partagé', 'Objectifs choisis avec le patient', 'Plan d’action écrit remis au patient', 'Désignation d’un professionnel référent pour le patient'] },
    intervenir: { what: 'Éducation thérapeutique, réadaptation et ajustements selon le plan, chacun dans son champ de compétences.', who: [IDE, IPA, MK, PH, DIET, APA],
      how: ['Séances d’éducation thérapeutique', 'Réadaptation / activité physique adaptée', 'Autosurveillance expliquée au patient', 'Transmission dans le dossier après chaque intervention'] },
    suivre: { who: [MG, IDE, IPA], when: ['Selon la fréquence fixée dans le PPS', 'À 1 mois puis tous les 3 mois', 'Après chaque hospitalisation'],
      how: ['Consultations alternées médecin / infirmier', 'Rappels programmés dans le logiciel partagé', 'Revue des dossiers en réunion de concertation', 'Mise à jour du PPS'] },
    alerter: { who: [MG, IDE, IPA], how: ['Liste des signes d’alerte validée et remise au patient', 'Créneau de soins non programmés réservé', 'Appel direct du médecin traitant', 'Courrier d’adressage vers le spécialiste ou l’hôpital'] }
  },
  chron: {
    reperer: { what: 'Repérer les patients à risque de chronicisation ou de désinsertion socioprofessionnelle (symptômes persistants, arrêts répétés).', who: [MG, MK, IDE],
      when: ['Lors d’un arrêt de travail prolongé ou répété', 'Au-delà d’une durée de symptômes fixée par l’équipe', 'Lors d’une consultation de suivi'],
      how: ['Questionnaire de repérage choisi par l’équipe', 'Information et accord du patient tracés dans le dossier', 'Signalement au référent du protocole'] },
    evaluer: { what: 'Évaluer le retentissement fonctionnel, psychologique, social et professionnel.', who: [MG, MK, PSY],
      how: ['Échelles d’évaluation choisies par l’équipe', 'Repérage des facteurs psychosociaux', 'Point sur la situation professionnelle', 'Synthèse tracée dans le dossier partagé'] },
    planifier: { how: ['Objectifs fonctionnels choisis avec le patient', 'Plan personnalisé de santé (PPS) partagé', 'Lien avec le médecin du travail, avec l’accord du patient'] },
    intervenir: { what: 'Interventions actives et cohérentes entre professionnels : activité, rééducation, soutien.', who: [MK, PSY, APA, IDE],
      how: ['Programme d’exercices / kinésithérapie active', 'Soutien psychologique', 'Éducation à la gestion de la douleur ou du stress', 'Messages cohérents entre les professionnels'] },
    suivre: { who: [MG, MK], when: ['Réévaluation à date fixe définie dans le PPS', 'Avant la reprise du travail', 'En réunion de concertation'],
      how: ['Réévaluation avec les mêmes échelles', 'Revue des dossiers en réunion de concertation', 'Préparation de la reprise du travail'] },
    alerter: { how: ['Signes d’alerte définis par l’équipe', 'Orientation vers le spécialiste, le centre de la douleur ou le CMP', 'Conduite à tenir face à un risque suicidaire validée par l’équipe', 'Lien avec le service de prévention et de santé au travail'] }
  },
  iatro: {
    reperer: { what: 'Identifier les patients sous traitement à risque iatrogénique ou nécessitant un équilibre thérapeutique fin.', who: [MG, PH, IDE],
      when: ['À l’initiation du traitement', 'À la sortie d’hospitalisation', 'Lors de la délivrance en officine'],
      how: ['Liste des patients extraite du logiciel', 'Signalement par le pharmacien', 'Carnet de suivi remis au patient'] },
    evaluer: { what: 'Faire le point sur le traitement, les interactions, les résultats biologiques et la compréhension du patient.', who: [PH, MG, IDE],
      how: ['Bilan partagé de médication', 'Entretien pharmaceutique', 'Vérification des derniers résultats biologiques', 'Évaluation de l’autonomie du patient pour son traitement'] },
    planifier: { what: 'Définir les cibles, la fréquence de surveillance et qui ajuste le traitement.', who: [MG, PH, IDE],
      how: ['Cibles et fréquence de contrôle écrites dans le dossier', 'Circuit des résultats biologiques défini', 'Professionnel qui ajuste le traitement désigné', 'Carnet ou application de suivi pour le patient'] },
    intervenir: { what: 'Éducation, aide à la prise du traitement et ajustements selon le circuit défini.', who: [IDE, PH, MG],
      how: ['Éducation thérapeutique', 'Accompagnement à l’autosurveillance', 'Pilulier / préparation des doses si besoin', 'Transmission de chaque ajustement à l’équipe'] },
    suivre: { who: [MG, PH, IDE], when: ['À chaque résultat biologique', 'À chaque renouvellement', 'Après tout changement de traitement'],
      how: ['Tableau de suivi partagé', 'Concertation médecin / pharmacien / infirmier', 'Conciliation médicamenteuse après hospitalisation'] },
    alerter: { who: [MG, PH, IDE], when: ['Dès un résultat hors cible', 'Dès un événement indésirable défini par l’équipe', 'Le jour même'],
      how: ['Conduite à tenir écrite et remise au patient', 'Appel du médecin le jour même', 'Déclaration des événements indésirables (pharmacovigilance)'] }
  },
  domicile: {
    reperer: { what: 'Repérer la fragilité, la perte d’autonomie ou la complexité de la situation à domicile.', who: [MG, IDE, MK, PH],
      when: ['Lors d’une visite à domicile', 'Après une chute ou une hospitalisation', 'Sur signalement d’un aidant ou d’un partenaire', 'Lors du renouvellement d’ordonnance'],
      how: ['Outil de repérage de la fragilité choisi par l’équipe', 'Signalement par tout professionnel au référent', 'Accord du patient (et de l’aidant) tracé'] },
    evaluer: { what: 'Évaluation globale à domicile : autonomie, nutrition, chutes, cognition, médicaments, environnement, aidant.', who: [IDE, MG, ERGO, MK, DIET, PH],
      how: ['Visite à domicile conjointe', 'Évaluation de la nutrition (poids, appétit)', 'Bilan partagé de médication', 'Évaluation de l’épuisement de l’aidant'] },
    planifier: { what: 'Construire le PPS : objectifs, intervenants, aides à domicile, en lien avec le patient et l’aidant.', who: [MG, IDE, COORD],
      how: ['Plan personnalisé de santé (PPS) partagé', 'Réunion de concertation avec le patient et l’aidant', 'Mise en place des aides, avec le dispositif d’appui à la coordination si besoin', 'Directives anticipées et personne de confiance abordées'] },
    intervenir: { what: 'Soins et accompagnement à domicile selon le PPS.', who: [IDE, MK, ERGO, DIET, POD],
      how: ['Soins infirmiers et kinésithérapie à domicile', 'Adaptation du logement', 'Prise en charge nutritionnelle', 'Soutien à l’aidant'] },
    suivre: { who: [MG, IDE, COORD], when: ['Selon la fréquence fixée dans le PPS', 'Après chaque hospitalisation', 'En réunion de concertation trimestrielle'],
      how: ['Cahier de liaison au domicile', 'Transmissions dans le dossier partagé', 'Mise à jour du PPS'] },
    alerter: { who: [MG, IDE], how: ['Signes d’aggravation définis par l’équipe', 'Appel du médecin traitant', 'Recours au DAC, à l’HAD ou à l’équipe mobile', 'Fiche de liaison urgence laissée au domicile'] }
  },
  obesite: {
    reperer: { what: 'Repérer le surpoids et l’obésité et proposer un accompagnement, sans stigmatisation.', who: [MG, IDE, SF, PH],
      when: ['À chaque consultation de suivi', 'Lors des examens de santé de l’enfant', 'À la demande du patient'],
      how: ['IMC (ou courbe de corpulence chez l’enfant) renseigné dans le dossier', 'Sujet abordé avec l’accord du patient', 'Proposition d’une consultation dédiée'] },
    evaluer: { what: 'Évaluation globale : habitudes alimentaires, activité physique, sommeil, retentissement psychologique et social, comorbidités.', who: [MG, DIET, PSY, APA],
      how: ['Consultation dédiée', 'Bilan diététique', 'Évaluation de la condition physique', 'Repérage d’un trouble du comportement alimentaire'] },
    planifier: { what: 'Fixer avec le patient (et sa famille) des objectifs réalistes et le plan d’accompagnement.', how: ['Objectifs choisis avec le patient', 'Plan personnalisé de santé (PPS) partagé', 'Désignation d’un professionnel référent pour le patient'] },
    intervenir: { what: 'Accompagnement pluriprofessionnel : alimentation, activité physique, soutien psychologique.', who: [DIET, APA, PSY, MK, IDE],
      how: ['Accompagnement diététique', 'Activité physique adaptée', 'Soutien psychologique', 'Ateliers d’éducation thérapeutique'] },
    suivre: { when: ['Tous les mois les 6 premiers mois', 'Selon la fréquence fixée dans le PPS'], how: ['Consultations de suivi alternées', 'Revue des dossiers en réunion de concertation', 'Mise à jour du PPS'] },
    alerter: { how: ['Orientation vers un centre spécialisé de l’obésité selon le niveau de complexité', 'Orientation en cas de trouble du comportement alimentaire', 'Courrier d’adressage vers le spécialiste'] }
  },
  grossesse: {
    reperer: { what: 'Repérer les situations à risque médical ou psychosocial dès le début de la grossesse.', who: [SF, MG, PH],
      when: ['Dès la déclaration de grossesse', 'Lors de l’entretien prénatal précoce', 'À chaque consultation de suivi'],
      how: ['Entretien prénatal précoce', 'Repérage des vulnérabilités (isolement, précarité, addictions, violences)', 'Accord de la patiente pour le partage d’informations'] },
    evaluer: { what: 'Évaluer le niveau de risque et les besoins de la patiente et de son entourage.', who: [SF, MG, PSY],
      how: ['Avis spécialisé dans les situations prévues par les recommandations', 'Évaluation psychosociale', 'Repérage des consommations (tabac, alcool, autres)'] },
    planifier: { what: 'Organiser le suivi : qui suit, lien avec la maternité et la PMI, partenaires.', who: [SF, MG],
      how: ['Plan de suivi partagé', 'Lien avec la maternité et la PMI', 'Staff médico-psycho-social si besoin'] },
    intervenir: { what: 'Suivi de grossesse et accompagnement adaptés aux risques repérés.', who: [SF, MG, PSY, DIET],
      how: ['Préparation à la naissance et à la parentalité', 'Accompagnement à l’arrêt du tabac', 'Soutien psychologique', 'Accompagnement social'] },
    suivre: { who: [SF, MG], when: ['À chaque consultation mensuelle', 'Après l’accouchement (post-partum)'],
      how: ['Transmissions à la maternité', 'Visite postnatale', 'Repérage de la dépression du post-partum'] },
    alerter: { who: [SF, MG], how: ['Signes d’alerte remis à la patiente', 'Orientation urgente vers la maternité', 'Information préoccupante si danger pour l’enfant'] }
  },
  psychosocial: {
    reperer: { what: 'Repérer les situations rendues complexes par des troubles psychiques, du comportement, des difficultés sociales ou des violences.', who: [MG, IDE, SF, ACC],
      when: ['Lors de toute consultation', 'Sur signalement d’un professionnel de l’équipe', 'Lors d’un événement de vie'],
      how: ['Question systématique sur les violences, validée par l’équipe', 'Signes d’alerte partagés dans l’équipe', 'Accueil confidentiel'] },
    evaluer: { what: 'Évaluer la situation : danger immédiat, besoins de soins, droits sociaux, ressources de la personne.', who: [MG, PSY, IDE],
      how: ['Évaluation du danger immédiat', 'Point sur les droits sociaux (couverture, aides)', 'Certificat médical descriptif si besoin'] },
    planifier: { what: 'Construire un plan d’accompagnement avec la personne et les partenaires.', who: [MG, COORD],
      how: ['Concertation pluriprofessionnelle', 'Lien avec les travailleurs sociaux', 'Référent unique pour la personne'] },
    intervenir: { what: 'Soins et accompagnement adaptés aux difficultés de la personne.', who: [MG, PSY, IDE],
      how: ['Soutien psychologique', 'Accompagnement aux démarches', 'Rendez-vous adaptés (durée, horaires, rappels)'] },
    suivre: { when: ['Selon la fréquence fixée dans le plan', 'En réunion de concertation'], how: ['Revue des dossiers en réunion de concertation', 'Transmissions dans le dossier partagé'] },
    alerter: { how: ['Signalement ou information préoccupante selon le cadre légal', 'Orientation vers le CMP ou les urgences psychiatriques', 'Numéros d’aide remis (3919, 119…)'] }
  },
  hors: {}
};

/* Indicateurs proposés (organisationnels) — à compléter : cible, source, fréquence, responsable */
const INDICATORS = {
  _base: ['Nombre de patients inclus dans le protocole sur l’année', 'Part des patients inclus ayant un plan de suivi (PPS) tracé dans le dossier', 'Nombre de dossiers revus en réunion de concertation'],
  decomp: ['Nombre d’hospitalisations non programmées des patients inclus sur l’année', 'Part des patients ayant reçu un plan d’action écrit'],
  chron: ['Part des patients réévalués à la date prévue', 'Nombre de patients ayant repris une activité professionnelle'],
  iatro: ['Part des patients ayant eu un bilan partagé de médication', 'Nombre d’événements indésirables déclarés et analysés'],
  domicile: ['Part des patients avec évaluation de l’aidant tracée', 'Nombre de passages aux urgences évités ou d’hospitalisations non programmées'],
  obesite: ['Part des patients ayant un suivi diététique ou d’activité physique adaptée', 'Part des patients ayant atteint l’objectif fixé avec eux'],
  grossesse: ['Part des femmes enceintes suivies ayant eu l’entretien prénatal précoce', 'Nombre de situations orientées vers la maternité ou la PMI'],
  psychosocial: ['Nombre de situations repérées et orientées', 'Délai entre repérage et première prise en charge'],
  hors: []
};

/* Thématiques (sous-thèmes) proposées dans le filtre */
const THEMES = [
  { id: 'ic', cat: 'decomp', label: 'Insuffisance cardiaque', kw: 'cardio coeur ic decompensation', title: 'Parcours coordonné du patient insuffisant cardiaque',
    profs: [MG, IDE, IPA, PH, MK, DIET, APA],
    extra: { suivre: ['Autosurveillance du poids et des symptômes par le patient'], alerter: ['Seuils d’alerte de prise de poids définis par l’équipe'] },
    refs: ['HAS – Guide du parcours de soins : insuffisance cardiaque (version en vigueur à vérifier)'] },
  { id: 'bpco', cat: 'decomp', label: 'BPCO', kw: 'bronchopneumopathie respiratoire tabac', title: 'Parcours coordonné du patient atteint de BPCO',
    profs: [MG, IDE, IPA, PH, MK, APA],
    extra: { evaluer: ['Vérification de la technique d’inhalation'], intervenir: ['Réhabilitation respiratoire', 'Accompagnement à l’arrêt du tabac'] },
    refs: ['HAS – Guide du parcours de soins : bronchopneumopathie chronique obstructive (version en vigueur à vérifier)'] },
  { id: 'asthme', cat: 'decomp', label: 'Asthme instable', kw: 'respiratoire crise inhalateur', title: 'Coordination de la prise en charge de l’asthme non contrôlé',
    profs: [MG, IDE, PH, MK],
    extra: { evaluer: ['Vérification de la technique d’inhalation', 'Évaluation du contrôle de l’asthme (questionnaire)'], planifier: ['Plan d’action écrit en cas de crise'] },
    refs: ['Recommandations en vigueur sur l’asthme (HAS, sociétés savantes) : à rechercher et dater'] },
  { id: 'psygrave', cat: 'decomp', label: 'Troubles psychiques graves', kw: 'psychiatrie schizophrenie bipolaire sante mentale', title: 'Coordination soins somatiques et psychiatriques des patients avec troubles psychiques graves',
    profs: [MG, IDE, PH, PSY],
    extra: { planifier: ['Lien formalisé avec le CMP / secteur psychiatrique'], suivre: ['Suivi somatique des patients sous psychotropes'] },
    refs: ['HAS – Coordination entre le médecin généraliste et les différents acteurs de soins dans la prise en charge des patients adultes souffrant de troubles mentaux (2018)'] },

  { id: 'lombalgie', cat: 'chron', label: 'Lombalgie chronique invalidante', kw: 'dos douleur rachis arret travail', title: 'Prévention de la chronicisation et de la désinsertion dans la lombalgie',
    profs: [MG, MK, PSY, APA, IDE],
    refs: ['HAS – Prise en charge du patient présentant une lombalgie commune (2019)'] },
  { id: 'anxiodep', cat: 'chron', label: 'Syndrome anxio-dépressif', kw: 'depression anxiete sante mentale burn out', title: 'Coordination de la prise en charge du syndrome anxio-dépressif',
    profs: [MG, PSY, IDE, PH],
    refs: ['HAS – Épisode dépressif caractérisé de l’adulte : prise en charge en soins de premier recours (2017)'] },
  { id: 'douleur', cat: 'chron', label: 'Autre pathologie chronique à soins itératifs', kw: 'douleur chronique fibromyalgie', title: 'Coordination du parcours pour une pathologie chronique',
    profs: [MG, MK, IDE, PSY], refs: [] },

  { id: 'avk', cat: 'iatro', label: 'Anticoagulants oraux (AVK, AOD)', kw: 'avk inr anticoagulant aod saignement', title: 'Suivi coordonné des patients sous anticoagulants oraux',
    profs: [MG, PH, IDE],
    extra: { planifier: ['Circuit de l’INR défini (laboratoire, qui reçoit, qui ajuste)'] },
    refs: ['HAS / ANSM – documents de bon usage des anticoagulants oraux : à rechercher et dater'] },
  { id: 'insuline', cat: 'iatro', label: 'Insulinothérapie / diabète', kw: 'diabete insuline glycemie hypoglycemie', title: 'Coordination de l’insulinothérapie en ville',
    profs: [MG, IDE, IPA, PH, DIET, POD],
    extra: { intervenir: ['Éducation à l’autosurveillance glycémique et à l’adaptation des doses'], suivre: ['Examen des pieds et dépistage des complications programmés'] },
    refs: ['HAS – Stratégie thérapeutique du patient vivant avec un diabète de type 2 (2024)'] },
  { id: 'polymed', cat: 'iatro', label: 'Polymédication de la personne âgée', kw: 'iatrogenie medicaments personne agee', title: 'Prévention de la iatrogénie médicamenteuse chez la personne âgée polymédiquée',
    profs: [MG, PH, IDE],
    refs: ['HAS – Prendre en charge une personne âgée polypathologique en soins primaires (2015)'] },

  { id: 'fragile', cat: 'domicile', label: 'Sujet âgé fragilisé (isolement, dénutrition, chutes)', kw: 'personne agee fragilite denutrition chute isolement autonomie', title: 'Repérage et prise en charge de la fragilité de la personne âgée à domicile',
    profs: [MG, IDE, MK, PH, ERGO, DIET],
    refs: ['HAS – Comment repérer la fragilité en soins ambulatoires ? (2013)', 'HAS – Diagnostic de la dénutrition chez la personne de 70 ans et plus (2021)'] },
  { id: 'plaies', cat: 'domicile', label: 'Plaies chroniques (escarres, ulcères, pied diabétique)', kw: 'escarre ulcere plaie pansement pied diabetique', title: 'Prise en charge coordonnée des plaies chroniques à domicile',
    profs: [MG, IDE, POD, PH, DIET],
    extra: { planifier: ['Protocole de soins de plaie commun à l’équipe'], suivre: ['Photographies de suivi dans le dossier, avec l’accord du patient'] },
    refs: ['HAS – recommandations sur l’ulcère de jambe et les escarres : versions en vigueur à vérifier'] },
  { id: 'polypath', cat: 'domicile', label: 'Patient polypathologique', kw: 'complexe multimorbidite', title: 'Coordination du parcours du patient polypathologique',
    profs: [MG, IDE, PH, COORD],
    refs: ['HAS – Prendre en charge une personne âgée polypathologique en soins primaires (2015)'] },
  { id: 'palliatif', cat: 'domicile', label: 'Soins palliatifs à domicile', kw: 'fin de vie palliatif', title: 'Accompagnement en soins palliatifs à domicile',
    profs: [MG, IDE, PH, MK, PSY],
    extra: { planifier: ['Lien avec l’équipe mobile ou le réseau de soins palliatifs', 'Anticipation des prescriptions et des situations de crise'] },
    refs: ['HAS – L’essentiel de la démarche palliative (2016)'] },
  { id: 'avc', cat: 'domicile', label: 'Suivi post-AVC', kw: 'avc accident vasculaire cerebral reeducation', title: 'Suivi coordonné du patient après un AVC',
    profs: [MG, IDE, MK, ORTHO, ERGO, PH],
    extra: { intervenir: ['Rééducation (kinésithérapie, orthophonie, ergothérapie)'], suivre: ['Contrôle des facteurs de risque cardiovasculaire'] },
    refs: ['Recommandations en vigueur sur le suivi après AVC (HAS) : à rechercher et dater'] },

  { id: 'obad', cat: 'obesite', label: 'Obésité de l’adulte', kw: 'poids imc surpoids', title: 'Parcours coordonné de l’adulte en situation d’obésité',
    profs: [MG, IDE, DIET, APA, PSY, MK],
    refs: ['HAS – Guide du parcours de soins : surpoids et obésité de l’adulte (version en vigueur à vérifier)'] },
  { id: 'obenf', cat: 'obesite', label: 'Surpoids et obésité de l’enfant et de l’adolescent', kw: 'enfant pediatrie poids imc', title: 'Parcours coordonné de l’enfant et de l’adolescent en surpoids ou obésité',
    profs: [MG, DIET, APA, PSY, IDE],
    refs: ['HAS – Guide du parcours de soins : surpoids et obésité chez l’enfant et l’adolescent (version en vigueur à vérifier)'] },

  { id: 'grrisque', cat: 'grossesse', label: 'Grossesse à risque (pathologie, antécédents, grossesse multiple)', kw: 'enceinte grossesse diabete gestationnel hta', title: 'Coordination du suivi des grossesses à risque',
    profs: [SF, MG, PH, DIET],
    refs: ['HAS – Suivi et orientation des femmes enceintes en fonction des situations à risque identifiées (version en vigueur à vérifier)'] },
  { id: 'grvuln', cat: 'grossesse', label: 'Grossesse en contexte de vulnérabilité (isolement, précarité, addictions)', kw: 'enceinte precarite addiction isolement violence', title: 'Accompagnement des grossesses en situation de vulnérabilité',
    profs: [SF, MG, PSY, PH],
    refs: ['HAS – Préparation à la naissance et à la parentalité (version en vigueur à vérifier)'] },

  { id: 'violences', cat: 'psychosocial', label: 'Violences conjugales et intrafamiliales', kw: 'maltraitance violence femme couple', title: 'Repérage et accompagnement des victimes de violences intrafamiliales',
    profs: [MG, SF, IDE, PSY, ACC],
    refs: ['HAS – Repérage des femmes victimes de violences au sein du couple (2019)'] },
  { id: 'enfance', cat: 'psychosocial', label: 'Maltraitance de l’enfant', kw: 'enfant maltraitance danger signalement', title: 'Repérage et conduite à tenir face à une maltraitance de l’enfant',
    profs: [MG, SF, IDE, PSY],
    refs: ['HAS – Maltraitance chez l’enfant : repérage et conduite à tenir (version en vigueur à vérifier)'] },
  { id: 'precarite', cat: 'psychosocial', label: 'Pathologie compliquée par des difficultés sociales ou des troubles psychiques', kw: 'precarite social psychique comportement', title: 'Coordination des prises en charge complexifiées par des difficultés sociales ou psychiques',
    profs: [MG, IDE, PSY, COORD], refs: [] },

  { id: 'tabac', cat: 'hors', label: 'Sevrage tabagique', kw: 'tabac fumeur addiction', title: 'Prise en charge du patient fumeur',
    profs: [MG, IDE, SF, MK, PH, ACC],
    link: { href: 'https://adelinefemas.github.io/Sevrage-tabagique/', text: 'Outil dédié FEMAS HDF : l’atelier protocole tabac' },
    refs: ['HAS – Arrêt de la consommation de tabac : du dépistage individuel au maintien de l’abstinence en premier recours (2014)'] },
  { id: 'autre', cat: 'hors', label: 'Autre thème choisi par l’équipe', kw: 'autre libre', title: '', profs: [MG, IDE], refs: [] }
];

const METHOD_REF = 'HAS – Comment élaborer et mettre en œuvre des protocoles pluriprofessionnels ? (2015)';
