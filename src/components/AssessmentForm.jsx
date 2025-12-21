import React, { useState, useRef, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, Activity, User, Scale, Calendar, Target, FileText, Ruler, Heart, Brain, Dumbbell, ClipboardList, Plus, Trash2, Bold, Italic, Underline } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoHorizontal from '../assets/V_Horizontal_Blancoyverde.png';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
       if (value === '' && editorRef.current.innerHTML === '<br>') return; 
       editorRef.current.innerHTML = value;
    }
  }, [value]);

  const checkFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  };

  const handleCommand = (e, command) => {
    e.preventDefault();
    document.execCommand(command, false, null);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    checkFormats();
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
        <button
          type="button"
          onMouseDown={(e) => handleCommand(e, 'bold')}
          className={`p-1.5 rounded transition-colors ${activeFormats.bold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Negrita"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleCommand(e, 'italic')}
          className={`p-1.5 rounded transition-colors ${activeFormats.italic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Cursiva"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleCommand(e, 'underline')}
          className={`p-1.5 rounded transition-colors ${activeFormats.underline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Subrayado"
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[100px] outline-none text-sm text-gray-700"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onKeyUp={checkFormats}
        onMouseUp={checkFormats}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default function AssessmentForm() {
  const [formData, setFormData] = useState({
    personal: {
      name: '',
      age: '',
      weight: '',
      height: '',
      phone: '',
      email: '',
      date: new Date().toISOString().split('T')[0],
      objectives: ''
    },
    pathologies: '',
    lifestyle: {
      description: '',
      factors: [
        { id: 'sleep', name: 'Sueño', value: 5 },
        { id: 'nutrition', name: 'Nutrición', value: 5 },
        { id: 'neat', name: 'NEAT', value: 5 },
        { id: 'stress', name: 'Estrés', value: 5 },
        { id: 'bodyComp', name: 'Comp. Corporal', value: 5 }
      ]
    },
    capabilities: {
      fuerza: 5,
      cardio: 5,
      flexibilidad: 5,
      resistencia: 5,
      equilibrio: 5
    },
    functionalAssessment: '',
    strengthTest: '',
    composition: {
      weight: '',
      fatPercentage: '',
      muscleMass: '',
      waterPercentage: '',
      boneMass: '',
      metabolicAge: '',
      visceralFat: ''
    },
    workProposal: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [name]: value }
    }));
  };

  const handleLifestyleDescriptionChange = (value) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: { ...prev.lifestyle, description: value }
    }));
  };

  const handleLifestyleFactorChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        factors: prev.lifestyle.factors.map(f => 
          f.id === id ? { ...f, [field]: field === 'value' ? parseInt(value) : value } : f
        )
      }
    }));
  };

  const addLifestyleFactor = () => {
    const newId = `factor-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        factors: [...prev.lifestyle.factors, { id: newId, name: 'Nuevo Factor', value: 5 }]
      }
    }));
  };

  const removeLifestyleFactor = (id) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        factors: prev.lifestyle.factors.filter(f => f.id !== id)
      }
    }));
  };

  const handleCapabilityChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      capabilities: { ...prev.capabilities, [key]: parseInt(value) }
    }));
  };

  const handleCompositionChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      composition: { ...prev.composition, [key]: parseFloat(value) || 0 }
    }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const radarData = useMemo(() => {
    return Object.entries(formData.capabilities).map(([key, value]) => ({
      subject: key.charAt(0).toUpperCase() + key.slice(1),
      A: value,
      fullMark: 10,
    }));
  }, [formData.capabilities]);

  const lifestyleData = useMemo(() => {
    return formData.lifestyle.factors.map(factor => ({
      subject: factor.name,
      A: factor.value,
      fullMark: 10,
    }));
  }, [formData.lifestyle.factors]);

  const pieData = useMemo(() => {
    return Object.entries(formData.composition).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));
  }, [formData.composition]);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageHeight = 297;
      const imgWidth = 210; // A4 width in mm
      const margin = 10; // margin in mm
      const contentWidth = imgWidth - (2 * margin);
      
      let currentY = margin;

      const sections = reportRef.current.querySelectorAll('.report-section');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Skip empty sections if any
        if (section.offsetHeight === 0) continue;

        const canvas = await html2canvas(section, {
          scale: 1.5, // Reduced scale for better file size
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff' // Ensure white background
        });

        // Use JPEG with compression instead of PNG
        const imgData = canvas.toDataURL('image/jpeg', 0.7);
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if we need a new page
        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'JPEG', margin, currentY, contentWidth, imgHeight, undefined, 'FAST');
        currentY += imgHeight + 5; // Add small gap between sections
      }

      pdf.save(`informe-valoracion-${formData.personal.name || 'cliente'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-500" />
          Datos del Cliente
        </h2>
        
        <div className="space-y-6">
          {/* Personal Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="name"
                required
                value={formData.personal.name}
                onChange={handlePersonalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.personal.phone}
                onChange={handlePersonalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej. +34 600 000 000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.personal.email}
                onChange={handlePersonalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej. cliente@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                name="date"
                value={formData.personal.date}
                onChange={handlePersonalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
              <input
                type="number"
                name="age"
                value={formData.personal.age}
                onChange={handlePersonalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.personal.weight}
                onChange={handlePersonalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.personal.height}
                onChange={handlePersonalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos</label>
              <input
                type="text"
                name="objectives"
                value={formData.personal.objectives}
                onChange={handlePersonalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej. Ganar masa muscular"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Pathologies */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-500" />
              Patologías y Antecedentes
            </h3>
            <textarea
              name="pathologies"
              value={formData.pathologies}
              onChange={handleTextChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describa patologías o antecedentes relevantes..."
            ></textarea>
          </div>

          <hr className="border-gray-200" />

          {/* Lifestyle */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Estilo de Vida
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción General</label>
                <textarea
                  value={formData.lifestyle.description}
                  onChange={(e) => handleLifestyleDescriptionChange(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describa el estilo de vida actual..."
                ></textarea>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Factores (Gráfico)</label>
                  <button
                    onClick={addLifestyleFactor}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Añadir Factor
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.lifestyle.factors.map((factor) => (
                    <div key={factor.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="text"
                          value={factor.name}
                          onChange={(e) => handleLifestyleFactorChange(factor.id, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nombre del factor"
                        />
                        <button
                          onClick={() => removeLifestyleFactor(factor.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar factor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={factor.value}
                          onChange={(e) => handleLifestyleFactorChange(factor.id, 'value', e.target.value)}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-sm font-medium text-gray-600 w-8 text-right">{factor.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Functional Assessment */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Valoración Funcional
            </h3>
            <RichTextEditor
              value={formData.functionalAssessment}
              onChange={(value) => setFormData(prev => ({ ...prev, functionalAssessment: value }))}
              placeholder="Resultados de la valoración funcional..."
            />
          </div>

          <hr className="border-gray-200" />

          {/* Strength Test */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              Test de Fuerza y Control Motor
            </h3>
            <textarea
              name="strengthTest"
              value={formData.strengthTest}
              onChange={handleTextChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Resultados de los tests de fuerza..."
            ></textarea>
          </div>

          <hr className="border-gray-200" />

          {/* Capabilities (Chart Data Input) */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Datos Gráfico Físico (1-10)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.capabilities).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => handleCapabilityChange(key, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right text-sm text-gray-500">{value}/10</div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Composition (Pie Chart Data Input) */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              Composición Corporal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  value={formData.composition.weight}
                  onChange={(e) => handleCompositionChange('weight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Masa Grasa</label>
                <input
                  type="number"
                  value={formData.composition.fatPercentage}
                  onChange={(e) => handleCompositionChange('fatPercentage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masa Muscular (kg)</label>
                <input
                  type="number"
                  value={formData.composition.muscleMass}
                  onChange={(e) => handleCompositionChange('muscleMass', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Agua Corporal</label>
                <input
                  type="number"
                  value={formData.composition.waterPercentage}
                  onChange={(e) => handleCompositionChange('waterPercentage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masa Ósea (kg)</label>
                <input
                  type="number"
                  value={formData.composition.boneMass}
                  onChange={(e) => handleCompositionChange('boneMass', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad Metabólica (años)</label>
                <input
                  type="number"
                  value={formData.composition.metabolicAge}
                  onChange={(e) => handleCompositionChange('metabolicAge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grasa Visceral</label>
                <input
                  type="number"
                  value={formData.composition.visceralFat}
                  onChange={(e) => handleCompositionChange('visceralFat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Work Proposal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              Propuesta de Trabajo
            </h3>
            <textarea
              name="workProposal"
              value={formData.workProposal}
              onChange={handleTextChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Propuesta detallada de trabajo..."
            ></textarea>
          </div>

          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isGenerating ? (
              <>Generando PDF...</>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Descargar Informe PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="w-full lg:w-1/2">
        <div className="sticky top-8">
          <div 
            ref={reportRef} 
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 min-h-[800px]"
            style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
          >
            {/* Header Report */}
            <div className="flex justify-between items-center mb-8 border-b pb-6 report-section p-4">
              <div className="bg-green-100 px-4 rounded-lg">
                <img src={logoHorizontal.src} alt="Logo" className="h-48 object-contain" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-800">Informe de Valoración</h1>
                <div className="text-sm text-gray-500 mt-1">Fecha: {formData.personal.date}</div>
              </div>
            </div>

            {/* 1. Datos Personales */}
            <div className="mb-6 report-section p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">1. Datos Personales</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-gray-600">Nombre:</span> {formData.personal.name}</div>
                <div><span className="font-semibold text-gray-600">Edad:</span> {formData.personal.age} años</div>
                <div><span className="font-semibold text-gray-600">Peso:</span> {formData.personal.weight} kg</div>
                <div><span className="font-semibold text-gray-600">Altura:</span> {formData.personal.height} cm</div>
                <div><span className="font-semibold text-gray-600">Teléfono:</span> {formData.personal.phone}</div>
                <div><span className="font-semibold text-gray-600">Email:</span> {formData.personal.email}</div>
              </div>
            </div>

            {/* 2. Patologías */}
            <div className="mb-6 report-section p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">2. Patologías y Antecedentes</h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{formData.pathologies || 'Sin antecedentes relevantes registrados.'}</p>
            </div>

            {/* 3. Objetivo Principal */}
            <div className="mb-6 report-section p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">3. Objetivo Principal</h2>
              <p className="text-gray-700 text-sm">{formData.personal.objectives || 'No especificado.'}</p>
            </div>

            {/* 4. Estilo de Vida */}
            <div className="mb-6 report-section p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">4. Estilo de Vida</h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{formData.lifestyle.description || 'No se ha proporcionado descripción.'}</p>
            </div>

            {/* 5. Valoración Funcional */}
            <div className="mb-6 report-section p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">5. Valoración Funcional</h2>
              <div 
                className="text-gray-700 text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formData.functionalAssessment || 'Pendiente de valoración.' }}
              />
            </div>

            {/* 6. Test de Fuerza */}
            <div className="mb-6 report-section p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">6. Test de Fuerza y Control Motor</h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{formData.strengthTest || 'Pendiente de realización.'}</p>
            </div>

            {/* 7. Composición Corporal */}
            <div className="mb-6 report-section p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">7. Composición Corporal</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-gray-500 text-xs mb-1">Peso</div>
                  <div className="font-bold text-lg text-gray-800">{formData.composition.weight || '-'} <span className="text-xs font-normal">kg</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-gray-500 text-xs mb-1">% Grasa</div>
                  <div className="font-bold text-lg text-gray-800">{formData.composition.fatPercentage || '-'} <span className="text-xs font-normal">%</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-gray-500 text-xs mb-1">Masa Muscular</div>
                  <div className="font-bold text-lg text-gray-800">{formData.composition.muscleMass || '-'} <span className="text-xs font-normal">kg</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-gray-500 text-xs mb-1">% Agua</div>
                  <div className="font-bold text-lg text-gray-800">{formData.composition.waterPercentage || '-'} <span className="text-xs font-normal">%</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-gray-500 text-xs mb-1">Masa Ósea</div>
                  <div className="font-bold text-lg text-gray-800">{formData.composition.boneMass || '-'} <span className="text-xs font-normal">kg</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-gray-500 text-xs mb-1">Edad Metabólica</div>
                  <div className="font-bold text-lg text-gray-800">{formData.composition.metabolicAge || '-'} <span className="text-xs font-normal">años</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-gray-500 text-xs mb-1">Grasa Visceral</div>
                  <div className="font-bold text-lg text-gray-800">{formData.composition.visceralFat || '-'}</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 break-inside-avoid report-section p-4">
              {/* 8. Gráfico Valoración Física */}
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">8. Valoración Física</h3>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
                      <Radar
                        name="Físico"
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 9. Gráfico Estilo de Vida */}
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">9. Estilo de Vida</h3>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={lifestyleData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
                      <Radar
                        name="Estilo Vida"
                        dataKey="A"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 10. Propuesta de Trabajo */}
            <div className="mb-6 report-section p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">10. Propuesta de Trabajo</h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{formData.workProposal || 'Se definirá en base a los resultados.'}</p>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t text-center text-xs text-gray-400 report-section p-4">
              <p>Informe generado por Sistema de Valoración Física</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

