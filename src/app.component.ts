
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeminiService } from './services/gemini.service';
import { SummaryPreviewComponent } from './components/summary-preview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SummaryPreviewComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private geminiService = inject(GeminiService);

  // App State
  currentView = signal<'form' | 'generating' | 'preview'>('form');
  generatedSummary = signal<string>('');
  
  // Search State
  searchQuery = signal('');
  searchResult = signal<{ text: string, sources: string[] } | null>(null);
  isSearching = signal(false);
  showSearchPanel = signal(false);

  // --- DROPDOWN DATASETS (DM Level) ---

  karyotypes = [
    '46,XY',
    '46,XX',
    '45,X (Turner Syndrome)',
    '45,X / 46,XY Mosaicism',
    '47,XXY (Klinefelter Syndrome)',
    '46,XX / 46,XY Chimerism',
    'Mosaicism (Other)'
  ];

  praderStages = [
    'Prader 0 (Normal Female)',
    'Prader 1 (Clitoromegaly only)',
    'Prader 2 (Clitoromegaly + Posterior Labial Fusion)',
    'Prader 3 (Increased Fusion + Urogenital Sinus)',
    'Prader 4 (Micropenis/Clitoromegaly + Perineal Hypospadias)',
    'Prader 5 (Normal Male Appearance)'
  ];

  mullerianStructures = [
    'Present (Uterus + Fallopian Tubes)',
    'Absent',
    'Rudimentary / Hypoplastic',
    'Hemi-uterus',
    'Vaginal Atresia / Blind Pouch'
  ];

  genes = [
    'None / Pending',
    'SRY (Sex Determining Region Y)',
    'NR5A1 (SF-1)',
    'WT1 (Wilms Tumor 1)',
    'SOX9',
    'DHH',
    'AR (Androgen Receptor)',
    'SRD5A2 (5-alpha-reductase type 2)',
    'CYP21A2 (21-hydroxylase)',
    'CYP11B1 (11-beta-hydroxylase)',
    'CYP17A1 (17-alpha-hydroxylase)',
    'HSD3B2 (3-beta-HSD)',
    'POR (P450 Oxidoreductase)',
    'STAR (StAR protein)',
    'AMH / AMHR2',
    'DAX1 (NR0B1)',
    'MAMLD1'
  ];

  sexAssignedOptions = [
    'Pending / Undetermined',
    'Male',
    'Female',
    'Ambiguous'
  ];

  genderOptions = [
    'Pending / Delayed Assignment',
    'Male (Rearing as Boy)',
    'Female (Rearing as Girl)',
    'Reassigned Male (Previously Female)',
    'Reassigned Female (Previously Male)',
    'Identifying as Male (Gender Dysphoria)',
    'Identifying as Female (Gender Dysphoria)',
    'Non-Binary / Third Gender'
  ];

  diagnoses = {
    sexChromosome: [
      'Turner Syndrome (45,X)',
      'Klinefelter Syndrome (47,XXY)',
      'Mixed Gonadal Dysgenesis (45,X/46,XY)',
      'Ovotesticular DSD (Chimera 46,XX/46,XY)'
    ],
    xyDsd: [
      'Complete Gonadal Dysgenesis (Swyer Syndrome)',
      'Partial Gonadal Dysgenesis',
      'Gonadal Regression Syndrome (Vanishing Testis)',
      'Ovotesticular DSD (46,XY)',
      'Leydig Cell Hypoplasia (LHCGR defect)',
      'Defect in Androgen Biosynthesis - StAR',
      'Defect in Androgen Biosynthesis - 3β-HSD',
      'Defect in Androgen Biosynthesis - 17β-HSD3',
      '5α-Reductase Type 2 Deficiency',
      'Complete Androgen Insensitivity Syndrome (CAIS)',
      'Partial Androgen Insensitivity Syndrome (PAIS)',
      'Mild Androgen Insensitivity Syndrome (MAIS)',
      'Persistent Mullerian Duct Syndrome (PMDS)',
      'Isolated Hypospadias',
      'Isolated Cryptorchidism'
    ],
    xxDsd: [
      'Ovotesticular DSD (46,XX)',
      'Testicular DSD (46,XX SRY+)',
      'Congenital Adrenal Hyperplasia (21-OH Deficiency, Salt Wasting)',
      'Congenital Adrenal Hyperplasia (21-OH Deficiency, Simple Virilizing)',
      'Congenital Adrenal Hyperplasia (11β-OH Deficiency)',
      'P450 Oxidoreductase Deficiency (POR)',
      'Aromatase Deficiency',
      'Maternal Virilization (Drug/Tumor induced)',
      'Mullerian Agenesis (MRKH Syndrome)',
      'Vaginal Atresia / Transverse Vaginal Septum',
      'Cloacal Exstrophy'
    ]
  };

  // --- SCORE OPTIONS ---
  emsOptions = {
    fusion: [
      { label: '3 - Fused (Scrotal)', value: 3 },
      { label: '0 - Unfused', value: 0 }
    ],
    micropenis: [
      { label: '3 - No (Normal Size)', value: 3 },
      { label: '0 - Yes (Micropenis)', value: 0 }
    ],
    meatus: [
      { label: '3 - Normal', value: 3 },
      { label: '2 - Distal', value: 2 },
      { label: '1 - Mid-shaft', value: 1 },
      { label: '0 - Proximal', value: 0 }
    ],
    gonad: [
      { label: '1.5 - Labioscrotal', value: 1.5 },
      { label: '1.0 - Inguinal', value: 1 },
      { label: '0.5 - Abdominal', value: 0.5 },
      { label: '0.0 - Absent', value: 0 }
    ]
  };

  egsOptions = {
    fusion: [
      { label: '3 - Fused', value: 3 },
      { label: '1.5 - Posterior fusion', value: 1.5 },
      { label: '0 - Unfused', value: 0 }
    ],
    gtLength: [
      { label: '3 - >31 mm', value: 3 },
      { label: '2.5 - 26-30 mm', value: 2.5 },
      { label: '1.5 - 21-25 mm', value: 1.5 },
      { label: '1 - 10-20 mm', value: 1 },
      { label: '0 - <10 mm', value: 0 }
    ],
    meatus: [
      { label: '3 - Top of GT', value: 3 },
      { label: '2.5 - Coronal/Glandular', value: 2.5 },
      { label: '2 - Along GT', value: 2 },
      { label: '1.5 - At GT base', value: 1.5 },
      { label: '1 - Labioscrotal', value: 1 },
      { label: '0 - Perineal', value: 0 }
    ],
    gonad: [
      { label: '1.5 - Labioscrotal', value: 1.5 },
      { label: '1 - Inguino-labioscrotal', value: 1 },
      { label: '0.5 - Inguinal', value: 0.5 },
      { label: '0 - Impalpable', value: 0 }
    ]
  };

  // Main Form
  patientForm: FormGroup = this.fb.group({
    demographics: this.fb.group({
      name: ['', Validators.required],
      age: ['', Validators.required],
      dob: [''],
      sexAssigned: [this.sexAssignedOptions[0]],
      currentGender: [this.genderOptions[0]],
      uhid: [''],
      phone1: [''],
      email: [''],
      address: [''],
      ethnicOrigin: [''],
      education: [''],
      occupation: ['']
    }),

    clinicalHistory: this.fb.group({
      initialDiagnosis: [''],
      ageDiagnosis: [''],
      symptomsOnset: [''],
      symptomsCurrent: [''],
      
      // Specific Symptoms
      saltWasting: ['No'],
      hypertension: ['No'],
      hirsutism: ['No'],
      virilisation: ['No'],
      onsetAge: [''],
      
      // Puberty / Repro
      menarcheAge: [''],
      menstrualCycles: [''],
      precociousPuberty: ['No'],
      maritalStatus: ['Single'],
      parity: [''],
      infertility: [''],
      
      // Surgery
      surgeryHistory: ['No'],
      surgeryType: [''],
      surgeryAge: [''],
      
      comorbidities: ['None']
    }),

    examination: this.fb.group({
      height: [''],
      weight: [''],
      bmi: [''],
      targetHeight: [''],
      bp: [''],
      
      tannerBreastsGenitals: ['Stage 1'],
      tannerPubicHair: ['Stage 1'],
      fgScore: [''], // Modified Ferriman-Gallwey
      
      otherFindings: [''],
      
      // Phenotype Calculator Values
      praderStage: [this.praderStages[0]],
      pigmentation: ['Absent'],
      emsFusion: [3],
      emsMicropenis: [3],
      emsMeatus: [3],
      emsGonadRight: [1.5],
      emsGonadLeft: [1.5],
      egsFusion: [3],
      egsGtLength: [3],
      egsMeatus: [3],
      egsGonadRight: [1.5],
      egsGonadLeft: [1.5],
    }),

    investigations: this.fb.group({
      karyotype: [this.karyotypes[0]],
      geneMutation: [this.genes[0]],
      fishSry: ['Unknown'],
      
      // Routine Labs
      sodium: [''],
      potassium: [''],
      bicarbonate: [''],
      urea: [''],
      creatinine: [''],
      calcium: [''],
      lftSummary: [''],
      
      // Hormonal Panel
      val17ohp: [''],
      valTestosterone: [''],
      valCortisol8am: [''],
      val11Deoxycortisol: [''],
      valDheas: [''],
      valAldosterone: [''],
      valRenin: [''],
      valProgesterone: [''],
      valActh: [''],
      valDoc: [''], // Deoxycorticosterone
      val17OhPregnenolone: [''],
      valAndrostenedione: [''],
      
      // Urine
      valUrineKetosteroids: [''],
      valUrinePregnanetriol: [''],
      
      imagingText: [''],
      boneAge: ['']
    }),

    cahCriteria: this.fb.group({
      consanguinity: ['No'],
      saltWastingSx: ['No'],
      decreasedCortisol: ['No'],
      increasedAndrogens: ['No'], // 17OHP/DHEAS/Testo
      noDrugHistory: ['Yes'],
      justification: ['']
    }),

    treatment: this.fb.group({
      history: [''],
      current: ['']
    }),

    summary: this.fb.group({
      finalDiagnosis: ['', Validators.required],
      plan: ['']
    })
  });

  // Computed Signals for Scores
  currentEmsScore = signal(12);
  currentEgsScore = signal(12);

  constructor() {
    this.patientForm.get('examination')?.valueChanges.subscribe(val => {
      // Calculate EMS
      const ems = 
        (Number(val.emsFusion) || 0) + 
        (Number(val.emsMicropenis) || 0) + 
        (Number(val.emsMeatus) || 0) + 
        (Number(val.emsGonadRight) || 0) + 
        (Number(val.emsGonadLeft) || 0);
      this.currentEmsScore.set(ems);

      // Calculate EGS
      const egs = 
        (Number(val.egsFusion) || 0) + 
        (Number(val.egsGtLength) || 0) + 
        (Number(val.egsMeatus) || 0) + 
        (Number(val.egsGonadRight) || 0) + 
        (Number(val.egsGonadLeft) || 0);
      this.currentEgsScore.set(egs);
    });
  }

  calculateBMI() {
    const h = this.patientForm.get('examination.height')?.value;
    const w = this.patientForm.get('examination.weight')?.value;
    if (h && w) {
      const heightInM = h / 100;
      const bmi = (w / (heightInM * heightInM)).toFixed(1);
      this.patientForm.get('examination.bmi')?.setValue(bmi);
    }
  }

  async generateSummary() {
    if (this.patientForm.invalid) {
      alert('Please select the Final Diagnosis and fill required fields.');
      this.patientForm.markAllAsTouched();
      return;
    }

    this.currentView.set('generating');
    
    try {
      const data = {
        ...this.patientForm.value,
        scores: {
          EMS: this.currentEmsScore() + '/12',
          EGS: this.currentEgsScore() + '/12'
        }
      };
      
      const summary = await this.geminiService.generateDischargeSummary(data);
      this.generatedSummary.set(summary);
      this.currentView.set('preview');
    } catch (error) {
      alert('Failed to generate summary. Please check API configuration.');
      this.currentView.set('form');
    }
  }

  editData() {
    this.currentView.set('form');
  }

  toggleSearch() {
    this.showSearchPanel.update(v => !v);
  }

  async performSearch() {
    if (!this.searchQuery().trim()) return;
    this.isSearching.set(true);
    this.searchResult.set(null);
    try {
      const result = await this.geminiService.searchMedicalInfo(this.searchQuery());
      this.searchResult.set(result);
    } catch (e) {
      console.error(e);
      this.searchResult.set({ text: "Error performing search.", sources: []});
    } finally {
      this.isSearching.set(false);
    }
  }
}
