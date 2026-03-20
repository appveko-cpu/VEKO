import type { Vente, Produit, Goal } from "@/context/DataContext";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const DEMO_PRODUITS: Produit[] = [
  { id: "demo-p1", nom: "Wax imprimé Ankara", prix_revient: 3500, frais_transport: 500, prix_vente: 8000, commission: 500, nb_articles: 20 },
  { id: "demo-p2", nom: "Savon au karité", prix_revient: 800, frais_transport: 200, prix_vente: 2500, commission: 200, nb_articles: 50 },
  { id: "demo-p3", nom: "Tissu bogolan Mali", prix_revient: 5000, frais_transport: 800, prix_vente: 12000, commission: 800, nb_articles: 15 },
  { id: "demo-p4", nom: "Sac cuir artisanal", prix_revient: 7500, frais_transport: 1000, prix_vente: 18000, commission: 1000, nb_articles: 10 },
  { id: "demo-p5", nom: "Huile de palme bio", prix_revient: 1200, frais_transport: 300, prix_vente: 3500, commission: 300, nb_articles: 30 },
  { id: "demo-p6", nom: "Pagne bazin riche", prix_revient: 6000, frais_transport: 700, prix_vente: 14000, commission: 700, nb_articles: 12 },
];

export const DEMO_VENTES: Vente[] = [
  { id: "demo-v1", date: daysAgo(0), nom_client: "Aminata Diallo", tel: "77 123 45 67", produit: "Wax imprimé Ankara", nb_pieces: 2, prix_vente: 8000, ca: 16000, depenses: 9000, benefice: 7000, marge: 43.75, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v2", date: daysAgo(0), nom_client: "Ousmane Traoré", tel: "70 987 65 43", produit: "Savon au karité", nb_pieces: 5, prix_vente: 2500, ca: 12500, depenses: 5500, benefice: 7000, marge: 56, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v3", date: daysAgo(1), nom_client: "Fatou Koné", tel: "76 234 56 78", produit: "Tissu bogolan Mali", nb_pieces: 1, prix_vente: 12000, ca: 12000, depenses: 6600, benefice: 5400, marge: 45, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v4", date: daysAgo(1), nom_client: "Ibrahima Sarr", tel: "66 345 67 89", produit: "Sac cuir artisanal", nb_pieces: 1, prix_vente: 18000, ca: 18000, depenses: 9500, benefice: 8500, marge: 47.2, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v5", date: daysAgo(2), nom_client: "Mariam Coulibaly", tel: "65 456 78 90", produit: "Huile de palme bio", nb_pieces: 4, prix_vente: 3500, ca: 14000, depenses: 6800, benefice: 7200, marge: 51.4, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v6", date: daysAgo(2), nom_client: "Seydou Bah", tel: "62 567 89 01", produit: "Pagne bazin riche", nb_pieces: 2, prix_vente: 14000, ca: 28000, depenses: 14400, benefice: 13600, marge: 48.6, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v7", date: daysAgo(4), nom_client: "Kadiatou Camara", tel: "77 678 90 12", produit: "Wax imprimé Ankara", nb_pieces: 3, prix_vente: 8000, ca: 24000, depenses: 12500, benefice: 11500, marge: 47.9, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v8", date: daysAgo(5), nom_client: "Moussa Keïta", tel: "70 789 01 23", produit: "Savon au karité", nb_pieces: 8, prix_vente: 2500, ca: 20000, depenses: 9600, benefice: 10400, marge: 52, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v9", date: daysAgo(6), nom_client: "Aïssatou Diop", tel: "76 890 12 34", produit: "Sac cuir artisanal", nb_pieces: 2, prix_vente: 18000, ca: 36000, depenses: 17000, benefice: 19000, marge: 52.8, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v10", date: daysAgo(7), nom_client: "Drissa Sangaré", tel: "66 901 23 45", produit: "Tissu bogolan Mali", nb_pieces: 2, prix_vente: 12000, ca: 24000, depenses: 11600, benefice: 12400, marge: 51.7, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v11", date: daysAgo(10), nom_client: "Rokiatou Sylla", tel: "65 012 34 56", produit: "Pagne bazin riche", nb_pieces: 1, prix_vente: 14000, ca: 14000, depenses: 7400, benefice: 6600, marge: 47.1, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v12", date: daysAgo(12), nom_client: "Ismaëla Ndiaye", tel: "77 123 45 67", produit: "Huile de palme bio", nb_pieces: 6, prix_vente: 3500, ca: 21000, depenses: 10200, benefice: 10800, marge: 51.4, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v13", date: daysAgo(14), nom_client: "Bintou Touré", tel: "70 234 56 78", produit: "Wax imprimé Ankara", nb_pieces: 4, prix_vente: 8000, ca: 32000, depenses: 16500, benefice: 15500, marge: 48.4, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v14", date: daysAgo(18), nom_client: "Aliou Barry", tel: "76 345 67 89", produit: "Savon au karité", nb_pieces: 10, prix_vente: 2500, ca: 25000, depenses: 11500, benefice: 13500, marge: 54, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v15", date: daysAgo(20), nom_client: "Néné Baldé", tel: "66 456 78 90", produit: "Sac cuir artisanal", nb_pieces: 1, prix_vente: 18000, ca: 18000, depenses: 9500, benefice: 8500, marge: 47.2, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v16", date: daysAgo(22), nom_client: "Lamine Kouyaté", tel: "62 567 89 01", produit: "Tissu bogolan Mali", nb_pieces: 3, prix_vente: 12000, ca: 36000, depenses: 17400, benefice: 18600, marge: 51.7, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v17", date: daysAgo(25), nom_client: "Salimata Balde", tel: "77 678 90 12", produit: "Pagne bazin riche", nb_pieces: 2, prix_vente: 14000, ca: 28000, depenses: 14000, benefice: 14000, marge: 50, budget_pub_provisoire: false, retournee: false, source: "manual" },
  { id: "demo-v18", date: daysAgo(28), nom_client: "Amadou Ly", tel: "70 789 01 23", produit: "Huile de palme bio", nb_pieces: 5, prix_vente: 3500, ca: 17500, depenses: 8500, benefice: 9000, marge: 51.4, budget_pub_provisoire: false, retournee: false, source: "manual" },
];

export const DEMO_GOAL: Goal = {
  id: "demo-goal-1",
  user_id: "demo-user",
  type: "revenue",
  target_value: 500000,
  start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  created_at: daysAgo(30),
};
