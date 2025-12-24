import React, { useState, useRef, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, Activity, User, Scale, Calendar, Target, FileText, Ruler, Heart, Brain, Dumbbell, ClipboardList, Plus, Trash2, Bold, Italic, Underline, Image as ImageIcon, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/V_Blanco_verde.png';
import logoBlack from '../assets/logo-fitnessgoals-ES.png'

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
    capabilities: [
      { id: 'fuerza', name: 'Fuerza', value: 5 },
      { id: 'cardio', name: 'Cardio', value: 5 },
      { id: 'flexibilidad', name: 'Flexibilidad', value: 5 },
      { id: 'resistencia', name: 'Resistencia', value: 5 },
      { id: 'equilibrio', name: 'Equilibrio', value: 5 }
    ],
    functionalAssessment: '',
    strengthTest: '',
    composition: [
      { id: 'weight', name: 'Peso', value: '', unit: 'kg' },
      { id: 'fatPercentage', name: '% Masa Grasa', value: '', unit: '%' },
      { id: 'muscleMass', name: 'Masa Muscular', value: '', unit: 'kg' },
      { id: 'waterPercentage', name: '% Agua Corporal', value: '', unit: '%' },
      { id: 'boneMass', name: 'Masa Ósea', value: '', unit: 'kg' },
      { id: 'metabolicAge', name: 'Edad Metabólica', value: '', unit: 'años' },
      { id: 'visceralFat', name: 'Grasa Visceral', value: '', unit: '' }
    ],
    workProposal: '',
    photos: []
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

  const handleCapabilityChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.map(c => 
        c.id === id ? { ...c, [field]: field === 'value' ? parseInt(value) : value } : c
      )
    }));
  };

  const addCapability = () => {
    const newId = `cap-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      capabilities: [...prev.capabilities, { id: newId, name: 'Nueva Capacidad', value: 5 }]
    }));
  };

  const removeCapability = (id) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c.id !== id)
    }));
  };

  const handleCompositionChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      composition: prev.composition.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const addCompositionVariable = () => {
    const newId = `comp-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      composition: [...prev.composition, { id: newId, name: 'Nueva Variable', value: '', unit: '' }]
    }));
  };

  const removeCompositionVariable = (id) => {
    setFormData(prev => ({
      ...prev,
      composition: prev.composition.filter(c => c.id !== id)
    }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 3) {
      alert('Solo puedes subir un máximo de 3 fotos.');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, { url: reader.result, caption: '' }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoCaptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.map((photo, i) => 
        i === index ? { ...photo, caption: value } : photo
      )
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const radarData = useMemo(() => {
    return formData.capabilities.map(cap => ({
      subject: cap.name,
      A: cap.value,
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

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    let clone = null;

    try {
      // Create a clone of the report to force desktop layout
      const originalReport = reportRef.current;
      clone = originalReport.cloneNode(true);
      
      // Set fixed width on the clone to simulate desktop (A4-like width)
      // 800px is the maxWidth used in the desktop view
      clone.style.width = '800px';
      clone.style.maxWidth = '800px';
      clone.style.position = 'absolute';
      clone.style.top = '-10000px';
      clone.style.left = '0';
      clone.style.zIndex = '-1';
      clone.style.backgroundColor = '#ffffff';
      
      // Append to body so html2canvas can render it
      document.body.appendChild(clone);

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

      // Query sections from the CLONE instead of the original
      const sections = clone.querySelectorAll('.report-section');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Skip empty sections if any
        if (section.offsetHeight === 0) continue;

        const canvas = await html2canvas(section, {
          scale: 2, // Higher scale for better quality
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: 1200, // Simulate desktop window width to trigger correct media queries
          width: 800 // Force width of the canvas capture
        });

        // Use JPEG with compression instead of PNG
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
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
      // Clean up the clone
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
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
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Capacidades Físicas</label>
                <button
                  onClick={addCapability}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Añadir Capacidad
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.capabilities.map((cap) => (
                  <div key={cap.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="text"
                        value={cap.name}
                        onChange={(e) => handleCapabilityChange(cap.id, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre de capacidad"
                      />
                      <button
                        onClick={() => removeCapability(cap.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar capacidad"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={cap.value}
                        onChange={(e) => handleCapabilityChange(cap.id, 'value', e.target.value)}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-sm font-medium text-gray-600 w-8 text-right">{cap.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Composition (Pie Chart Data Input) */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              Composición Corporal
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Variables de Composición</label>
                <button
                  onClick={addCompositionVariable}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Añadir Variable
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.composition.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleCompositionChange(item.id, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre variable"
                      />
                      <button
                        onClick={() => removeCompositionVariable(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar variable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.value}
                        onChange={(e) => handleCompositionChange(item.id, 'value', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Valor"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleCompositionChange(item.id, 'unit', e.target.value)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Unidad"
                      />
                    </div>
                  </div>
                ))}
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

          <hr className="border-gray-200" />

          {/* Photo Gallery Upload */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Galería Fotográfica (Máx. 3)
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span></p>
                    <p className="text-xs text-gray-500">JPG, PNG, WEBP, BMP (MAX. 3 fotos)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp, image/bmp, image/heic, image/heif"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={formData.photos.length >= 3}
                  />
                </label>
              </div>

              {formData.photos.length > 0 && (
                <div className="space-y-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <img 
                        src={photo.url} 
                        alt={`Upload ${index + 1}`} 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => handlePhotoCaptionChange(index, e.target.value)}
                        placeholder="Escribe un pie de foto..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Eliminar foto"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <div className="bg-gradient-to-r from-green-700 to-green-900 text-white p-8 rounded-t-xl flex flex-col sm:flex-row justify-between items-center mb-8 report-section gap-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white p-3 rounded-xl shadow-md transform rotate-3 hover:rotate-0 transition-transform duration-300">
                   <img src={logoBlack.src} alt="Logo" className="h-24 w-auto object-contain" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold tracking-tight">Informe de Valoración</h1>
                  <p className="text-green-100 mt-1 text-lg font-light">Análisis Físico y Planificación</p>
                </div>
              </div>
              <div className="text-center sm:text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="text-xs text-green-200 uppercase tracking-wider font-bold mb-1">Fecha del Informe</div>
                <div className="text-sm font-bold font-mono">{formData.personal.date}</div>
              </div>
            </div>

            {/* 1. Datos Personales */}
            <div className="mb-8 report-section px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-green-800">1. Datos Personales</h2>
              </div>
              <div className="bg-green-50/50 p-6 rounded-xl border border-green-100 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="font-semibold text-green-700">Nombre</span>
                    <span className="text-gray-700 font-medium">{formData.personal.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="font-semibold text-green-700">Edad</span>
                    <span className="text-gray-700 font-medium">{formData.personal.age} años</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="font-semibold text-green-700">Peso</span>
                    <span className="text-gray-700 font-medium">{formData.personal.weight} kg</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="font-semibold text-green-700">Altura</span>
                    <span className="text-gray-700 font-medium">{formData.personal.height} cm</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="font-semibold text-green-700">Teléfono</span>
                    <span className="text-gray-700 font-medium">{formData.personal.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="font-semibold text-green-700">Email</span>
                    <span className="text-gray-700 font-medium">{formData.personal.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Patologías */}
            <div className="mb-8 report-section px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <Heart className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-green-800">2. Patologías y Antecedentes</h2>
              </div>
              <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{formData.pathologies || 'Sin antecedentes relevantes registrados.'}</p>
              </div>
            </div>

            {/* 3. Objetivo Principal */}
            <div className="mb-8 report-section px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-green-800">3. Objetivo Principal</h2>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100 shadow-sm">
                <p className="text-gray-800 font-medium text-lg">{formData.personal.objectives || 'No especificado.'}</p>
              </div>
            </div>

            {/* 4. Estilo de Vida */}
            <div className="mb-8 report-section px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <Brain className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-green-800">4. Estilo de Vida</h2>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{formData.lifestyle.description || 'No se ha proporcionado descripción.'}</p>
              </div>
            </div>

            {/* 5. Valoración Funcional */}
            <div className="mb-8 report-section px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <Activity className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-green-800">5. Valoración Funcional</h2>
              </div>
              <div 
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-gray-700 text-sm whitespace-pre-wrap leading-relaxed prose prose-green max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.functionalAssessment || 'Pendiente de valoración.' }}
              />
            </div>

            {/* 6. Test de Fuerza */}
            <div className="mb-8 report-section px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-green-800">6. Test de Fuerza y Control Motor</h2>
              </div>
              <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{formData.strengthTest || 'Pendiente de realización.'}</p>
              </div>
            </div>

            {/* 7. Composición Corporal */}
            <div className="mb-8 report-section px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <Scale className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-green-800">7. Composición Corporal</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {formData.composition.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow text-center group">
                    <div className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2 group-hover:text-green-700">{item.name}</div>
                    <div className="font-bold text-2xl text-gray-800 group-hover:text-green-800 transition-colors">
                      {item.value || '-'} <span className="text-sm font-medium text-gray-400">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 break-inside-avoid report-section px-8">
              {/* 8. Gráfico Valoración Física */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  8. Valoración Física
                </h3>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
                      <Radar
                        name="Físico"
                        dataKey="A"
                        stroke="#15803d"
                        fill="#15803d"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 9. Gráfico Estilo de Vida */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  9. Estilo de Vida
                </h3>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={lifestyleData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
                      <Radar
                        name="Estilo Vida"
                        dataKey="A"
                        stroke="#059669"
                        fill="#059669"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 10. Propuesta de Trabajo */}
            <div className="mb-8 report-section px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-green-800">10. Propuesta de Trabajo</h2>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed font-medium">{formData.workProposal || 'Se definirá en base a los resultados.'}</p>
              </div>
            </div>

            {/* 11. Galería Fotográfica */}
            {formData.photos.length > 0 && (
              <div className="mb-8 report-section px-8 break-inside-avoid">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg text-green-700">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-green-800">11. Galería Fotográfica</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-start">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="flex-1 flex flex-col gap-2 min-w-0 w-full sm:w-auto bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden w-full">
                        <img 
                          src={photo.url} 
                          alt={`Foto ${index + 1}`} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      {photo.caption && (
                        <p className="text-center text-sm text-gray-600 italic px-1 break-words w-full mt-2">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-100 text-center report-section p-4 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Informe generado por Fitness Goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

