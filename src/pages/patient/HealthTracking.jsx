import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from "../../components/DashboardLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Heart,
  Weight,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Clock,
  Target,
  Bell,
  Download,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle,
  Activity,
  Circle
} from 'lucide-react';
import axios from 'axios';

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Configuration API
const API_BASE_URL = 'http://localhost:8083/api/health';

export default function HealthTracking() {
  // État pour le patient (à remplacer par l'authentification réelle)
  const [patientId] = useState(1);
  const [patientInfo, setPatientInfo] = useState({ name: "—", age: "—", gender: "—" });

  // États principaux
  const [activeMetric, setActiveMetric] = useState('tension');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // États pour les données
  const [dashboardStats, setDashboardStats] = useState({
    tension: { last: '--/-- mmHg', trend: 'stable', color: 'text-gray-600' },
    poids: { last: '-- kg', trend: 'stable', color: 'text-gray-600' },
    glycemie: { last: '-- mg/dL', trend: 'normal', color: 'text-gray-600' }
  });

  const [measurements, setMeasurements] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [goals] = useState({ tension: '< 130/80 mmHg', poids: 72.0, glycemie: '< 100 mg/dL' });

  // État pour le formulaire
  const [newValue, setNewValue] = useState({ systolique: '', diastolique: '', valeur: '' });

  // État pour les filtres
  const [dateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // État pour les rappels
  const [reminders, setReminders] = useState({ tension: true, poids: true, glycemie: false });

  // Ref pour capturer le graphique en PDF
  const chartRef = useRef(null);

  // Charger les données initiales
  useEffect(() => {
    fetchDashboardData();
    fetchMeasurements();
    fetchRecentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recharger les mesures quand la métrique active change
  useEffect(() => {
    fetchMeasurements();
    fetchRecentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMetric]);

  // Fonction pour charger les statistiques du dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/dashboard/${patientId}`);

      if (response?.data?.stats) {
        setDashboardStats(response.data.stats);
      }

      if (response?.data?.patient) {
        setPatientInfo({
          name: response.data.patient.name ?? "",
          age: response.data.patient.age ?? "",
          gender: response.data.patient.gender ?? ""
        });
      }
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les mesures historiques
  const fetchMeasurements = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/measurements/${patientId}/${activeMetric}`,
        { params: { startDate: dateRange.start, endDate: dateRange.end } }
      );

      if (Array.isArray(response.data)) {
        setMeasurements(response.data);
      } else {
        setMeasurements(getSimulatedData());
      }
    } catch (error) {
      console.error('Erreur chargement mesures:', error);
      setMeasurements(getSimulatedData());
    }
  };

  // Fonction pour charger l'historique récent
  const fetchRecentHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recent/${patientId}/${activeMetric}`);

      if (Array.isArray(response.data)) {
        setRecentHistory(response.data.slice(0, 5));
      } else {
        setRecentHistory(getSimulatedRecentData());
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setRecentHistory(getSimulatedRecentData());
    }
  };

  // Données simulées pour le développement
  const getSimulatedData = () => {
    const today = new Date();

    if (activeMetric === 'tension') {
      return Array.from({ length: 10 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (10 - i));
        return {
          id: i + 1,
          date: date.toISOString(),
          systolique: 120 + Math.floor(Math.random() * 25),
          diastolique: 75 + Math.floor(Math.random() * 15),
          type: 'tension',
          patient: { id: patientId }
        };
      });
    } else if (activeMetric === 'poids') {
      return Array.from({ length: 10 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (10 - i));
        return {
          id: i + 1,
          date: date.toISOString(),
          valeur: 73.5 - (i * 0.15) + (Math.random() * 0.3),
          type: 'poids',
          patient: { id: patientId }
        };
      });
    } else {
      return Array.from({ length: 10 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (10 - i));
        const hours = ['7h', '12h', '19h', '22h'];
        return {
          id: i + 1,
          date: date.toISOString(),
          valeur: 85 + Math.floor(Math.random() * 40),
          type: 'glycemie',
          patient: { id: patientId },
          heure: hours[i % 4]
        };
      });
    }
  };

  const getSimulatedRecentData = () => {
    const today = new Date();

    if (activeMetric === 'tension') {
      return Array.from({ length: 5 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return {
          id: i + 1,
          date: date.toISOString(),
          systolique: 130 + Math.floor(Math.random() * 15),
          diastolique: 80 + Math.floor(Math.random() * 10),
          type: 'tension'
        };
      });
    } else if (activeMetric === 'poids') {
      return Array.from({ length: 5 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7));
        return {
          id: i + 1,
          date: date.toISOString(),
          valeur: 74.5 - (i * 0.1),
          type: 'poids'
        };
      });
    } else {
      return Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        date: today.toISOString(),
        valeur: [95, 140, 110, 100][i],
        type: 'glycemie',
        heure: ['7h', '12h', '19h', '22h'][i]
      }));
    }
  };

  // Fonction pour ajouter une nouvelle mesure
  const addNewMeasurement = async () => {
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        type: activeMetric,
        patientId: patientId,
        date: new Date().toISOString()
      };

      if (activeMetric === 'tension') {
        payload.systolique = parseInt(newValue.systolique, 10);
        payload.diastolique = parseInt(newValue.diastolique, 10);

        if (
          payload.systolique < 50 || payload.systolique > 250 ||
          payload.diastolique < 30 || payload.diastolique > 150
        ) {
          alert('Valeurs de tension invalides. Systolique: 50-250, Diastolique: 30-150');
          setSaving(false);
          return;
        }
      } else {
        payload.valeur = parseFloat(newValue.valeur);

        if (activeMetric === 'poids' && (payload.valeur < 20 || payload.valeur > 300)) {
          alert('Valeur de poids invalide. Poids: 20-300 kg');
          setSaving(false);
          return;
        } else if (activeMetric === 'glycemie' && (payload.valeur < 20 || payload.valeur > 600)) {
          alert('Valeur de glycémie invalide. Glycémie: 20-600 mg/dL');
          setSaving(false);
          return;
        }
      }

      // Simulation pour le développement
      setTimeout(() => {
        if (activeMetric === 'tension') {
          const newTension = {
            last: `${payload.systolique}/${payload.diastolique} mmHg`,
            trend: 'stable',
            color: 'text-green-600',
            systolique: payload.systolique,
            diastolique: payload.diastolique
          };
          setDashboardStats(prev => ({ ...prev, tension: newTension }));
        } else if (activeMetric === 'poids') {
          const newPoids = {
            last: `${payload.valeur.toFixed(1)} kg`,
            trend: 'en baisse',
            color: 'text-green-600',
            valeur: payload.valeur
          };
          setDashboardStats(prev => ({ ...prev, poids: newPoids }));
        } else {
          const newGlycemie = {
            last: `${payload.valeur} mg/dL`,
            trend: payload.valeur < 100 ? 'normal' : 'élevé',
            color: payload.valeur < 100 ? 'text-green-600' : 'text-yellow-600',
            valeur: payload.valeur
          };
          setDashboardStats(prev => ({ ...prev, glycemie: newGlycemie }));
        }

        const newMeasurement = { id: Date.now(), date: new Date().toISOString(), ...payload };
        setMeasurements(prev => [...prev, newMeasurement]);
        setRecentHistory(prev => [newMeasurement, ...prev.slice(0, 4)]);
        setNewValue({ systolique: '', diastolique: '', valeur: '' });
        alert('Mesure enregistrée avec succès !');
        setSaving(false);
      }, 500);
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      alert("Erreur lors de l'enregistrement");
      setSaving(false);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    if (activeMetric === 'tension') {
      return (
        newValue.systolique.trim() !== '' &&
        newValue.diastolique.trim() !== '' &&
        !isNaN(parseInt(newValue.systolique, 10)) &&
        !isNaN(parseInt(newValue.diastolique, 10))
      );
    } else {
      return newValue.valeur.trim() !== '' && !isNaN(parseFloat(newValue.valeur));
    }
  };

  // Formater les données pour les graphiques
  const formatChartData = () => {
    if (!measurements || measurements.length === 0) return [];
    const frenchMonths = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

    return measurements.slice(-10).map(m => {
      const date = new Date(m.date);
      const dateStr = `${date.getDate()}/${frenchMonths[date.getMonth()]}`;

      if (activeMetric === 'tension') {
        return {
          date: dateStr,
          systolique: m.systolique,
          diastolique: m.diastolique,
          label: `${m.systolique}/${m.diastolique}`
        };
      } else {
        return {
          date: dateStr,
          valeur: m.valeur,
          label: `${m.valeur} ${activeMetric === 'poids' ? 'kg' : 'mg/dL'}`
        };
      }
    });
  };

  // Calculer la progression vers l'objectif
  const calculateProgress = () => {
    const progress = { tension: 75, poids: 60, glycemie: 85 };

    if (dashboardStats?.poids?.valeur && goals.poids) {
      const current = dashboardStats.poids.valeur;
      const target = goals.poids;

      if (current <= target) {
        progress.poids = 100;
      } else {
        const start = 85;
        progress.poids = Math.max(0, Math.min(100, ((start - current) / (start - target)) * 100));
      }
    }

    if (dashboardStats?.tension?.systolique) {
      const sys = dashboardStats.tension.systolique;
      const dia = dashboardStats.tension.diastolique;

      if (sys <= 130 && dia <= 80) {
        progress.tension = 100;
      } else {
        const sysProgress = Math.max(0, ((180 - sys) / (180 - 130)) * 100);
        const diaProgress = Math.max(0, ((110 - dia) / (110 - 80)) * 100);
        progress.tension = (sysProgress + diaProgress) / 2;
      }
    }

    if (dashboardStats?.glycemie?.valeur) {
      const glucose = dashboardStats.glycemie.valeur;

      if (glucose <= 100) {
        progress.glycemie = 100;
      } else {
        progress.glycemie = Math.max(0, ((200 - glucose) / (200 - 100)) * 100);
      }
    }

    return progress;
  };

  // Obtenir l'icône de tendance
  const getTrendIcon = (trend) => {
    if ((trend || '').includes('hausse')) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if ((trend || '').includes('baisse')) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    } else if (trend === 'normal' || trend === 'stable') {
      return <Minus className="w-4 h-4 text-green-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Gérer le changement des rappels
  const handleReminderToggle = (metric) => {
    setReminders(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  // Exporter en PDF avec le graphique + tableau
  const exportData = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const fileName = `sante_${activeMetric}_${dateStr}.pdf`;

      // ====== Header ======
      doc.setFontSize(16);
      doc.text("Exporter mes données de santé", 14, 16);

      doc.setFontSize(11);
      doc.text(`Patient ID: ${patientId}`, 14, 24);
      doc.text(`Métrique: ${activeMetric}`, 14, 30);
      doc.text(`Période: ${dateRange.start} → ${dateRange.end}`, 14, 36);

      // ====== Capture du graphique ======
      let nextY = 44;

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");

        // A4 width (mm) ~ 210, marges 14mm => largeur utile 182mm
        const pageWidth = 210;
        const marginX = 14;
        const usableWidth = pageWidth - marginX * 2;

        // Conserver ratio
        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Si l'image dépasse trop, on la limite
        const maxImgHeight = 90;
        const finalImgHeight = Math.min(imgHeight, maxImgHeight);

        doc.setFontSize(12);
        doc.text("Graphique", 14, nextY);
        nextY += 4;

        doc.addImage(imgData, "PNG", marginX, nextY, imgWidth, finalImgHeight);
        nextY += finalImgHeight + 8;
      }

      // ====== Tableau ======
      const rows = (measurements || []).map(m => {
        const d = new Date(m.date);
        const dateLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

        if (activeMetric === "tension") {
          return [dateLabel, `${m.systolique ?? ""}/${m.diastolique ?? ""} mmHg`];
        }

        if (activeMetric === "poids") {
          return [dateLabel, `${(m.valeur ?? "").toString()} kg`];
        }

        return [dateLabel, `${(m.valeur ?? "").toString()} mg/dL`, m.heure ?? ""];
      });

      const head =
        activeMetric === "tension"
          ? [["Date", "Tension (sys/dia)"]]
          : activeMetric === "poids"
            ? [["Date", "Poids"]]
            : [["Date", "Glycémie", "Heure"]];

      autoTable(doc, {
        head,
        body: rows.length ? rows : [["Aucune donnée", "", ""]],
        startY: nextY,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 41, 59] } // slate-800 (lisible)
      });

      doc.save(fileName);
    } catch (e) {
      console.error("Erreur export PDF:", e);
      alert("Erreur lors de l'export PDF");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-slate-600">Chargement de vos données de santé...</p>
          <p className="text-sm text-slate-500 mt-2">Cela peut prendre quelques instants</p>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();
  const chartData = formatChartData();

  return (
    <DashboardLayout>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Suivi Santé</h1>
            <p className="text-slate-600 mt-2">Enregistrez et visualisez vos constantes vitales</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tension */}
        <div className="card hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Tension artérielle</h3>
                <div className="text-xs text-slate-500">Dernière mesure</div>
              </div>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded ${dashboardStats.tension.color}`}>
              {dashboardStats.tension.trend}
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {dashboardStats.tension.last}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            {getTrendIcon(dashboardStats.tension.trend)}
            <span className="ml-2">Tendance {dashboardStats.tension.trend}</span>
          </div>
        </div>

        {/* Poids */}
        <div className="card hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Weight className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Poids</h3>
                <div className="text-xs text-slate-500">Dernière mesure</div>
              </div>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded ${dashboardStats.poids.color}`}>
              {dashboardStats.poids.trend}
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {dashboardStats.poids.last}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            {getTrendIcon(dashboardStats.poids.trend)}
            <span className="ml-2">Tendance {dashboardStats.poids.trend}</span>
          </div>
        </div>

        {/* Glycémie */}
        <div className="card hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Droplets className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Glycémie</h3>
                <div className="text-xs text-slate-500">Dernière mesure</div>
              </div>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded ${dashboardStats.glycemie.color}`}>
              {dashboardStats.glycemie.trend}
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {dashboardStats.glycemie.last}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            {getTrendIcon(dashboardStats.glycemie.trend)}
            <span className="ml-2">Niveau {dashboardStats.glycemie.trend}</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sélecteur */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex space-x-1 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeMetric === 'tension'
                      ? 'bg-white text-red-600 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setActiveMetric('tension')}
                >
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Tension
                  </div>
                </button>

                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeMetric === 'poids'
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setActiveMetric('poids')}
                >
                  <div className="flex items-center">
                    <Weight className="w-4 h-4 mr-2" />
                    Poids
                  </div>
                </button>

                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeMetric === 'glycemie'
                      ? 'bg-white text-orange-600 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setActiveMetric('glycemie')}
                >
                  <div className="flex items-center">
                    <Droplets className="w-4 h-4 mr-2" />
                    Glycémie
                  </div>
                </button>
              </div>
            </div>

            {/* Graphique */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4 text-slate-800">
                Évolution {activeMetric === 'tension' ? 'de la tension' : activeMetric === 'poids' ? 'du poids' : 'de la glycémie'}
              </h3>

              <div className="h-80" ref={chartRef}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {activeMetric === 'tension' ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value) => [`${value} mmHg`, '']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="systolique"
                          stroke="#ef4444"
                          strokeWidth={3}
                          name="Systolique"
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="diastolique"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          name="Diastolique"
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </LineChart>
                    ) : activeMetric === 'poids' ? (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value) => [`${value} kg`, 'Poids']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Bar dataKey="valeur" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Poids" />
                      </BarChart>
                    ) : (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value) => [`${value} mg/dL`, 'Glycémie']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area type="monotone" dataKey="valeur" stroke="#f59e0b" fill="#fef3c7" strokeWidth={3} name="Glycémie" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Activity className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Aucune donnée disponible</p>
                    <p className="text-sm">Commencez par ajouter vos premières mesures</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historique récent */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg text-slate-800">Historique récent</h3>
                <p className="text-sm text-slate-500">5 dernières mesures</p>
              </div>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>

            {recentHistory.length > 0 ? (
              <div className="space-y-3">
                {recentHistory.map((item, index) => {
                  const itemDate = new Date(item.date);
                  const frenchMonths = [
                    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
                  ];
                  const day = String(itemDate.getDate()).padStart(2, '0');
                  const month = frenchMonths[itemDate.getMonth()];
                  const year = itemDate.getFullYear();
                  const hours = String(itemDate.getHours()).padStart(2, '0');
                  const minutes = String(itemDate.getMinutes()).padStart(2, '0');

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors duration-200 border border-slate-100"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg mr-4">
                          <span className="text-sm font-medium text-slate-700">{day}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {day} {month} {year}
                          </div>
                          <div className="text-xs text-slate-500">
                            {hours}:{minutes} {item.heure ? `• ${item.heure}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-lg text-slate-900">
                          {activeMetric === 'tension'
                            ? `${item.systolique}/${item.diastolique} mmHg`
                            : `${item.valeur?.toFixed(activeMetric === 'poids' ? 1 : 0)} ${activeMetric === 'poids' ? 'kg' : 'mg/dL'}`}
                        </div>
                        {index === 0 && (
                          <span className="text-xs text-green-600 font-medium">Dernière mesure</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Aucune mesure récente</p>
                <p className="text-sm mt-1">Ajoutez votre première mesure ci-dessous</p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-8">
          {/* Ajouter une mesure */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-6 text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-600" />
              Ajouter une mesure
            </h3>

            {activeMetric === 'tension' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Systolique (mmHg)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={newValue.systolique}
                    onChange={e => setNewValue({ ...newValue, systolique: e.target.value })}
                    placeholder="ex: 120"
                  />
                  <div className="text-xs text-slate-500 mt-1">Normal: 90-120 mmHg</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diastolique (mmHg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="150"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={newValue.diastolique}
                    onChange={e => setNewValue({ ...newValue, diastolique: e.target.value })}
                    placeholder="ex: 80"
                  />
                  <div className="text-xs text-slate-500 mt-1">Normal: 60-80 mmHg</div>
                </div>
              </div>
            ) : activeMetric === 'poids' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={newValue.valeur}
                  onChange={e => setNewValue({ ...newValue, valeur: e.target.value })}
                  placeholder="ex: 74.0"
                />
                <div className="text-xs text-slate-500 mt-1">Indice de masse corporelle (IMC) recommandé: 18.5-25</div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Glycémie (mg/dL)
                </label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={newValue.valeur}
                  onChange={e => setNewValue({ ...newValue, valeur: e.target.value })}
                  placeholder="ex: 100"
                />
                <div className="text-xs text-slate-500 mt-1">Normal à jeun: 70-100 mg/dL</div>
              </div>
            )}

            <button
              className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                saving ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              } text-white flex items-center justify-center gap-2`}
              onClick={addNewMeasurement}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  Enregistrer la mesure
                </>
              )}
            </button>
          </div>

          {/* Objectifs et progression */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg text-slate-800">Objectifs santé</h3>
                <p className="text-sm text-slate-500">Progression vers vos buts</p>
              </div>
              <Target className="w-5 h-5 text-slate-400" />
            </div>

            <div className="space-y-6">
              {/* Tension */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Tension artérielle</span>
                  <span className="text-sm font-semibold text-slate-900">{goals.tension}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.tension}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{Math.round(progress.tension)}% atteint</div>
              </div>

              {/* Poids */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Poids cible</span>
                  <span className="text-sm font-semibold text-slate-900">{goals.poids} kg</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.poids}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{Math.round(progress.poids)}% atteint</div>
              </div>

              {/* Glycémie */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Glycémie normale</span>
                  <span className="text-sm font-semibold text-slate-900">{goals.glycemie}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.glycemie}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{Math.round(progress.glycemie)}% atteint</div>
              </div>
            </div>
          </div>

          {/* Rappels */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg text-slate-800">Rappels</h3>
                <p className="text-sm text-slate-500">Notifications de suivi</p>
              </div>
              <Bell className="w-5 h-5 text-slate-400" />
            </div>

            <div className="space-y-3">
              {Object.keys(reminders).map(metric => (
                <div
                  key={metric}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    {metric === 'tension' && <Heart className="w-4 h-4 text-red-500" />}
                    {metric === 'poids' && <Weight className="w-4 h-4 text-blue-500" />}
                    {metric === 'glycemie' && <Droplets className="w-4 h-4 text-orange-500" />}

                    <span className="text-sm font-medium text-slate-700">
                      {metric === 'tension'
                        ? 'Tension artérielle'
                        : metric === 'poids'
                          ? 'Poids'
                          : 'Glycémie'}
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={reminders[metric]}
                    onChange={() => handleReminderToggle(metric)}
                    className="w-5 h-5 rounded border-slate-300 text-primary-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Export PDF */}
          <button
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors duration-200"
            onClick={exportData}
          >
            <Download className="w-4 h-4" />
            Exporter mes données
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}