import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { calculateSeverityFromVitals, getSeverityLevel } from '../services/api';
import {
  ChevronDown, ChevronUp, CheckCircle, AlertTriangle, AlertCircle,
  Wind, Heart, Brain, Eye, Thermometer, Activity, Stethoscope,
  Bone, Droplets, Zap, ClipboardCheck, ArrowRight, Save
} from 'lucide-react';
import './EMTForm.css';

const SECTIONS = [
  { id: 'patientInfo', label: 'Patient Information', icon: ClipboardCheck, fields: ['age', 'gender'] },
  { id: 'abcde', label: 'ABCDE Assessment', icon: Activity, fields: ['airway', 'breathing', 'circulation', 'gcs'] },
  { id: 'vitals', label: 'Vital Signs', icon: Heart, fields: ['heartRate', 'spo2', 'respiratoryRate', 'systolicBP', 'temperature'] },
  { id: 'assessment', label: 'Clinical Assessment', icon: Stethoscope, fields: ['bleeding', 'skinCondition', 'capillaryRefill'] },
  { id: 'neurological', label: 'Neurological', icon: Brain, fields: ['pupilReaction', 'motorResponse'] },
  { id: 'cardiac', label: 'Cardiac', icon: Heart, fields: ['chestPain'] },
  { id: 'respiratory', label: 'Respiratory', icon: Wind, fields: ['dyspnea'] },
  { id: 'gi', label: 'Gastrointestinal', icon: Droplets, fields: [] },
  { id: 'trauma', label: 'Trauma Assessment', icon: Bone, fields: ['traumaMechanism'] },
];

function SliderField({ label, value, onChange, min = 0, max = 10, step = 1, unit = '', dangerThreshold, warningThreshold }) {
  const pct = ((value - min) / (max - min)) * 100;
  const isDanger = dangerThreshold !== undefined && value >= dangerThreshold;
  const isWarning = warningThreshold !== undefined && value >= warningThreshold && !isDanger;
  
  return (
    <div className={`slider-field ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
      <div className="slider-header">
        <label>{label}</label>
        <span className="slider-value mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-input"
        style={{
          background: `linear-gradient(to right, ${isDanger ? '#DC2626' : isWarning ? '#D97706' : '#3B82F6'} ${pct}%, #E2E8F0 ${pct}%)`
        }}
      />
      <div className="slider-labels">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, unit = '', min, max, dangerLow, dangerHigh, warningLow, warningHigh }) {
  const numVal = parseFloat(value) || 0;
  const isDanger = (dangerLow !== undefined && numVal < dangerLow) || (dangerHigh !== undefined && numVal > dangerHigh);
  const isWarning = (warningLow !== undefined && numVal < warningLow) || (warningHigh !== undefined && numVal > warningHigh);

  return (
    <div className={`number-input-field ${isDanger ? 'danger' : isWarning && !isDanger ? 'warning' : ''}`}>
      <label>{label}</label>
      <div className="number-input-wrap">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min} max={max}
          className="input mono"
        />
        {unit && <span className="number-unit">{unit}</span>}
      </div>
      {isDanger && <span className="field-alert danger-alert"><AlertTriangle size={11} /> Critical range</span>}
      {isWarning && !isDanger && <span className="field-alert warning-alert"><AlertCircle size={11} /> Abnormal</span>}
    </div>
  );
}

function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div className="toggle-group">
      <label>{label}</label>
      <div className="toggle-buttons">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`toggle-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxField({ label, checked, onChange }) {
  return (
    <label className={`checkbox-field ${checked ? 'checked' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="checkbox-custom" />
      <span className="checkbox-label">{label}</span>
    </label>
  );
}

export default function EMTForm() {
  const navigate = useNavigate();
  const { patientData, setPatientField, expandedSections, toggleSection, runPrediction, predictionLoading, triggerAutoSave } = useStore();
  const [liveScore, setLiveScore] = useState(0);
  const [liveSeverity, setLiveSeverity] = useState(null);

  // Real-time severity calculation
  useEffect(() => {
    const score = calculateSeverityFromVitals(patientData);
    setLiveScore(score);
    setLiveSeverity(getSeverityLevel(score));
  }, [patientData]);

  // Calculate section completion
  const getSectionCompletion = useCallback((sectionId) => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section || section.fields.length === 0) return 0;
    const filled = section.fields.filter(f => {
      const v = patientData[f];
      return v !== '' && v !== undefined && v !== null && v !== false;
    }).length;
    return Math.round((filled / section.fields.length) * 100);
  }, [patientData]);

  const totalCompletion = Math.round(
    SECTIONS.reduce((acc, s) => acc + getSectionCompletion(s.id), 0) / SECTIONS.length
  );

  const handleSubmit = async () => {
    try {
      await runPrediction();
      triggerAutoSave();
      toast.success('Triage assessment completed!');
      navigate('/prediction');
    } catch {
      toast.error('Prediction failed. Please try again.');
    }
  };

  const set = (field) => (value) => setPatientField(field, value);

  return (
    <div className="emt-form-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>EMT Triage Form</h2>
          <p className="page-subtitle">Complete patient assessment for severity prediction</p>
        </div>
        <div className="form-actions-top">
          <div className="live-severity-badge" style={{ borderColor: liveSeverity?.color || '#E2E8F0', color: liveSeverity?.color }}>
            <Activity size={14} />
            <span className="mono">{liveScore}</span>
            <span>{liveSeverity?.label || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="form-progress">
        <div className="form-progress-header">
          <span>Form Completion</span>
          <span className="mono">{totalCompletion}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${totalCompletion}%` }} />
        </div>
        <div className="section-badges">
          {SECTIONS.map(s => {
            const comp = getSectionCompletion(s.id);
            return (
              <span key={s.id} className={`section-badge ${comp === 100 ? 'complete' : comp > 0 ? 'partial' : ''}`}>
                {comp === 100 && <CheckCircle size={10} />}
                {s.label.split(' ')[0]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="form-sections">
        {/* Patient Info */}
        <FormSection
          section={SECTIONS[0]}
          expanded={expandedSections.patientInfo}
          onToggle={() => toggleSection('patientInfo')}
          completion={getSectionCompletion('patientInfo')}
        >
          <div className="form-grid cols-3">
            <NumberInput label="Age" value={patientData.age} onChange={set('age')} unit="yrs" min={0} max={120} />
            <ToggleGroup label="Gender" options={[{value:'male',label:'Male'},{value:'female',label:'Female'},{value:'other',label:'Other'}]} value={patientData.gender} onChange={set('gender')} />
            <CheckboxField label="Pregnancy" checked={patientData.pregnancy} onChange={set('pregnancy')} />
          </div>
          <div className="form-grid cols-1" style={{ marginTop: 12 }}>
            <div className="text-input-field">
              <label>Chief Complaint</label>
              <textarea
                className="input"
                rows={2}
                value={patientData.chiefComplaint}
                onChange={(e) => setPatientField('chiefComplaint', e.target.value)}
                placeholder="Describe the primary complaint..."
              />
            </div>
          </div>
        </FormSection>

        {/* ABCDE */}
        <FormSection
          section={SECTIONS[1]}
          expanded={expandedSections.abcde}
          onToggle={() => toggleSection('abcde')}
          completion={getSectionCompletion('abcde')}
        >
          <div className="abcde-grid">
            <div className="abcde-card">
              <div className="abcde-letter">A</div>
              <SliderField label="Airway Patency" value={patientData.airway} onChange={set('airway')} min={0} max={10} dangerThreshold={8} warningThreshold={5} />
            </div>
            <div className="abcde-card">
              <div className="abcde-letter">B</div>
              <SliderField label="Breathing Difficulty" value={patientData.breathing} onChange={set('breathing')} min={0} max={10} dangerThreshold={8} warningThreshold={5} />
            </div>
            <div className="abcde-card">
              <div className="abcde-letter">C</div>
              <SliderField label="Circulation Status" value={patientData.circulation} onChange={set('circulation')} min={0} max={10} dangerThreshold={8} warningThreshold={5} />
            </div>
            <div className="abcde-card">
              <div className="abcde-letter">D</div>
              <NumberInput label="GCS Score (3-15)" value={patientData.gcs} onChange={set('gcs')} min={3} max={15} dangerLow={8} warningLow={12} />
            </div>
            <div className="abcde-card">
              <div className="abcde-letter">E</div>
              <div className="exposure-toggles">
                <CheckboxField label="Hypothermia" checked={patientData.exposureHypothermia} onChange={set('exposureHypothermia')} />
                <CheckboxField label="Burns" checked={patientData.exposureBurns} onChange={set('exposureBurns')} />
                <CheckboxField label="Rash / Skin" checked={patientData.exposureRash} onChange={set('exposureRash')} />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Vital Signs */}
        <FormSection
          section={SECTIONS[2]}
          expanded={expandedSections.vitals}
          onToggle={() => toggleSection('vitals')}
          completion={getSectionCompletion('vitals')}
        >
          <div className="form-grid cols-2">
            <SliderField label="Pain Level" value={patientData.pain} onChange={set('pain')} min={0} max={10} dangerThreshold={8} warningThreshold={5} />
            <NumberInput label="Heart Rate" value={patientData.heartRate} onChange={set('heartRate')} unit="bpm" min={20} max={250} dangerLow={50} dangerHigh={150} warningLow={60} warningHigh={100} />
            <NumberInput label="SpO2" value={patientData.spo2} onChange={set('spo2')} unit="%" min={0} max={100} dangerLow={88} warningLow={95} />
            <NumberInput label="Respiratory Rate" value={patientData.respiratoryRate} onChange={set('respiratoryRate')} unit="/min" min={0} max={60} dangerLow={8} dangerHigh={30} warningLow={12} warningHigh={24} />
            <NumberInput label="Systolic BP" value={patientData.systolicBP} onChange={set('systolicBP')} unit="mmHg" min={0} max={300} dangerLow={80} dangerHigh={200} warningLow={90} warningHigh={180} />
            <NumberInput label="Diastolic BP" value={patientData.diastolicBP} onChange={set('diastolicBP')} unit="mmHg" min={0} max={200} />
            <NumberInput label="Temperature" value={patientData.temperature} onChange={set('temperature')} unit="°C" min={30} max={45} dangerLow={35} dangerHigh={40} warningLow={36} warningHigh={38.5} />
            <NumberInput label="Glucose" value={patientData.glucose} onChange={set('glucose')} unit="mg/dL" min={0} max={600} dangerLow={60} dangerHigh={300} warningLow={70} warningHigh={200} />
          </div>
        </FormSection>

        {/* Assessment */}
        <FormSection
          section={SECTIONS[3]}
          expanded={expandedSections.assessment}
          onToggle={() => toggleSection('assessment')}
          completion={getSectionCompletion('assessment')}
        >
          <div className="form-grid cols-3">
            <ToggleGroup label="Bleeding" options={[{value:'none',label:'None'},{value:'minor',label:'Minor'},{value:'major',label:'Major'},{value:'life-threatening',label:'Critical'}]} value={patientData.bleeding} onChange={set('bleeding')} />
            <ToggleGroup label="Skin Condition" options={[{value:'normal',label:'Normal'},{value:'pale',label:'Pale'},{value:'cyanotic',label:'Cyanotic'},{value:'flushed',label:'Flushed'},{value:'mottled',label:'Mottled'}]} value={patientData.skinCondition} onChange={set('skinCondition')} />
            <ToggleGroup label="Capillary Refill" options={[{value:'normal',label:'< 2s'},{value:'delayed',label:'2-4s'},{value:'absent',label:'> 4s'}]} value={patientData.capillaryRefill} onChange={set('capillaryRefill')} />
          </div>
        </FormSection>

        {/* Neurological */}
        <FormSection
          section={SECTIONS[4]}
          expanded={expandedSections.neurological}
          onToggle={() => toggleSection('neurological')}
          completion={getSectionCompletion('neurological')}
        >
          <div className="form-grid cols-2">
            <ToggleGroup label="Pupil Reaction" options={[{value:'normal',label:'Normal'},{value:'sluggish',label:'Sluggish'},{value:'fixed',label:'Fixed'},{value:'unequal',label:'Unequal'}]} value={patientData.pupilReaction} onChange={set('pupilReaction')} />
            <ToggleGroup label="Motor Response" options={[{value:'normal',label:'Normal'},{value:'weakness',label:'Weakness'},{value:'paralysis',label:'Paralysis'}]} value={patientData.motorResponse} onChange={set('motorResponse')} />
            <CheckboxField label="Sensory Deficit" checked={patientData.sensoryDeficit} onChange={set('sensoryDeficit')} />
            <CheckboxField label="Seizure Activity" checked={patientData.seizureActivity} onChange={set('seizureActivity')} />
          </div>
        </FormSection>

        {/* Cardiac */}
        <FormSection
          section={SECTIONS[5]}
          expanded={expandedSections.cardiac}
          onToggle={() => toggleSection('cardiac')}
          completion={getSectionCompletion('cardiac')}
        >
          <div className="form-grid cols-2">
            <CheckboxField label="Chest Pain Present" checked={patientData.chestPain} onChange={set('chestPain')} />
            {patientData.chestPain && (
              <ToggleGroup label="Chest Pain Type" options={[{value:'crushing',label:'Crushing'},{value:'sharp',label:'Sharp'},{value:'pressure',label:'Pressure'},{value:'burning',label:'Burning'}]} value={patientData.chestPainType} onChange={set('chestPainType')} />
            )}
            <CheckboxField label="Irregular Rhythm" checked={patientData.irregularRhythm} onChange={set('irregularRhythm')} />
            <CheckboxField label="Peripheral Edema" checked={patientData.peripheralEdema} onChange={set('peripheralEdema')} />
          </div>
        </FormSection>

        {/* Respiratory */}
        <FormSection
          section={SECTIONS[6]}
          expanded={expandedSections.respiratory}
          onToggle={() => toggleSection('respiratory')}
          completion={getSectionCompletion('respiratory')}
        >
          <div className="form-grid cols-2">
            <CheckboxField label="Dyspnea" checked={patientData.dyspnea} onChange={set('dyspnea')} />
            <CheckboxField label="Wheezing" checked={patientData.wheezing} onChange={set('wheezing')} />
            <CheckboxField label="Cyanosis" checked={patientData.cyanosis} onChange={set('cyanosis')} />
            <CheckboxField label="Oxygen Therapy Required" checked={patientData.oxygenTherapy} onChange={set('oxygenTherapy')} />
          </div>
        </FormSection>

        {/* GI */}
        <FormSection
          section={SECTIONS[7]}
          expanded={expandedSections.gi}
          onToggle={() => toggleSection('gi')}
          completion={getSectionCompletion('gi')}
        >
          <div className="form-grid cols-2">
            <CheckboxField label="Abdominal Pain" checked={patientData.abdominalPain} onChange={set('abdominalPain')} />
            <CheckboxField label="Nausea" checked={patientData.nausea} onChange={set('nausea')} />
            <CheckboxField label="Vomiting" checked={patientData.vomiting} onChange={set('vomiting')} />
            <CheckboxField label="Diarrhea" checked={patientData.diarrhea} onChange={set('diarrhea')} />
          </div>
        </FormSection>

        {/* Trauma */}
        <FormSection
          section={SECTIONS[8]}
          expanded={expandedSections.trauma}
          onToggle={() => toggleSection('trauma')}
          completion={getSectionCompletion('trauma')}
        >
          <div className="form-grid cols-2">
            <ToggleGroup label="Mechanism" options={[{value:'fall',label:'Fall'},{value:'mva',label:'MVA'},{value:'assault',label:'Assault'},{value:'penetrating',label:'Penetrating'},{value:'other',label:'Other'}]} value={patientData.traumaMechanism} onChange={set('traumaMechanism')} />
            <CheckboxField label="Head Injury" checked={patientData.headInjury} onChange={set('headInjury')} />
            <CheckboxField label="Spinal Injury Suspected" checked={patientData.spinalInjury} onChange={set('spinalInjury')} />
            <CheckboxField label="Fracture" checked={patientData.fracture} onChange={set('fracture')} />
            <CheckboxField label="Laceration" checked={patientData.laceration} onChange={set('laceration')} />
            <CheckboxField label="Burn Injury" checked={patientData.burnInjury} onChange={set('burnInjury')} />
          </div>
        </FormSection>
      </div>

      {/* Submit */}
      <div className="form-submit-area">
        <button className="btn btn-outline" onClick={() => { triggerAutoSave(); toast.success('Draft saved'); }}>
          <Save size={16} /> Save Draft
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={predictionLoading}>
          {predictionLoading ? (
            <><span className="btn-spinner" /> Running Prediction...</>
          ) : (
            <><Zap size={18} /> Run Triage Prediction <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}

function FormSection({ section, expanded, onToggle, completion, children }) {
  const Icon = section.icon;
  
  return (
    <div className={`form-section card ${expanded ? 'expanded' : ''}`}>
      <button className="section-header" onClick={onToggle} type="button">
        <div className="section-header-left">
          <div className="section-icon"><Icon size={18} /></div>
          <h3>{section.label}</h3>
          {completion === 100 && <span className="badge badge-success"><CheckCircle size={10} /> Complete</span>}
          {completion > 0 && completion < 100 && <span className="badge badge-warning">{completion}%</span>}
        </div>
        <div className={`section-chevron ${expanded ? 'rotated' : ''}`}>
          <ChevronDown size={18} />
        </div>
      </button>
      <div className={`section-content ${expanded ? 'open' : ''}`}>
        <div className="section-body">{children}</div>
      </div>
    </div>
  );
}
