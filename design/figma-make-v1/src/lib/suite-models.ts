export const modelConnectorKeys: Record<string, string[]> = {
  commercial: ["hubspot", "gmail", "sharepoint"],
  service_client: ["gmail", "sharepoint"],
  rh: ["gmail", "sharepoint"],
  technique: ["sharepoint"],
  administratif: ["sharepoint", "gmail"],
}

export const modelRecommendedDocuments: Record<string, string[]> = {
  commercial: ["Grille tarifaire", "Modèle de proposition", "Conditions de vente"],
  service_client: ["Procédures de support", "FAQ client"],
  rh: ["Livret d’accueil", "Politiques RH"],
  technique: ["Documentation produit", "Procédures d’intervention"],
  administratif: ["Procédures internes", "Modèles de documents"],
}
