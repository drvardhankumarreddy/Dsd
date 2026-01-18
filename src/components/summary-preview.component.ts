
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownPipe } from '../pipes/markdown.pipe';

@Component({
  selector: 'app-summary-preview',
  standalone: true,
  imports: [CommonModule, MarkdownPipe],
  template: `
    <div class="h-full flex flex-col bg-[#F8FAFC]">
      <!-- Toolbar (Sticky & Glassy) -->
      <div class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md no-print z-40 sticky top-0 shadow-sm gap-4">
        <div>
           <h2 class="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
             <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
             Generated Clinical Summary
           </h2>
           <p class="text-xs text-slate-500 font-bold uppercase tracking-wider ml-4">Ready for Final Review</p>
        </div>
        <div class="flex gap-3 w-full sm:w-auto">
          <button 
            (click)="onEdit.emit()"
            class="flex-1 sm:flex-none justify-center px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all focus:ring-4 focus:ring-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit Data
          </button>
          <button 
            (click)="printSummary()"
            class="flex-1 sm:flex-none justify-center px-6 py-2.5 text-sm font-bold text-white bg-blue-600 border-2 border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <!-- Content Area (A4 Paper Simulation) -->
      <div class="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100/50 scroll-smooth">
        <div class="mx-auto max-w-[21cm] bg-white shadow-2xl shadow-slate-300/40 min-h-[29.7cm] print-area relative animate-in fade-in slide-in-from-bottom-4 duration-500" id="print-section">
          
          <!-- Document Padding Wrapper -->
          <div class="p-[1.5cm] sm:p-[2cm] h-full flex flex-col">
            
            <!-- Hospital Header -->
            <div class="border-b-[3px] border-blue-900 pb-6 mb-10 text-center relative">
              <div class="absolute top-0 left-0 text-5xl opacity-5 font-serif select-none pointer-events-none">Rx</div>
              <h1 class="text-3xl font-serif font-bold text-blue-900 uppercase tracking-tight">Department of Endocrinology</h1>
              <div class="flex items-center justify-center gap-2 mt-2">
                 <div class="h-px w-8 bg-slate-300"></div>
                 <p class="text-slate-700 font-bold text-lg uppercase tracking-wider">Kurnool Medical College & GGH</p>
                 <div class="h-px w-8 bg-slate-300"></div>
              </div>
              <p class="text-slate-500 text-xs mt-1 uppercase tracking-[0.2em]">Kurnool, Andhra Pradesh</p>
            </div>

            <!-- Structured Patient Details Box -->
            @if (patientData(); as d) {
               <div class="mb-10 border-2 border-slate-800 rounded-sm overflow-hidden break-inside-avoid">
                 <div class="bg-slate-800 text-white p-2 font-bold text-center text-sm uppercase tracking-widest print:bg-slate-200 print:text-black print:border-b print:border-black">Patient Identity & Vitals</div>
                 
                 <!-- Basic Info Grid -->
                 <div class="p-5 grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-slate-900">
                    <div class="flex border-b border-dotted border-slate-300 pb-1">
                      <span class="font-bold w-32 shrink-0 text-slate-600 uppercase text-xs tracking-wide">Name</span> 
                      <span class="font-medium text-base">{{ d.demographics.name }}</span>
                    </div>
                    <div class="flex border-b border-dotted border-slate-300 pb-1">
                      <span class="font-bold w-32 shrink-0 text-slate-600 uppercase text-xs tracking-wide">Age / DOB</span> 
                      <span class="font-medium text-base">{{ d.demographics.age }} <span class="text-slate-400 font-normal text-xs mx-1">|</span> {{ d.demographics.dob | date }}</span>
                    </div>
                    <div class="flex border-b border-dotted border-slate-300 pb-1">
                      <span class="font-bold w-32 shrink-0 text-slate-600 uppercase text-xs tracking-wide">UHID</span> 
                      <span class="font-mono text-base">{{ d.demographics.uhid || 'N/A' }}</span>
                    </div>
                    <div class="flex border-b border-dotted border-slate-300 pb-1">
                      <span class="font-bold w-32 shrink-0 text-slate-600 uppercase text-xs tracking-wide">Sex (Assigned)</span> 
                      <span class="font-medium text-base">{{ d.demographics.sexAssigned }}</span>
                    </div>
                    <div class="flex border-b border-dotted border-slate-300 pb-1">
                      <span class="font-bold w-32 shrink-0 text-slate-600 uppercase text-xs tracking-wide">Gender (Rearing)</span> 
                      <span class="font-medium text-base">{{ d.demographics.currentGender }}</span>
                    </div>
                    @if(d.demographics.phone1){
                      <div class="flex border-b border-dotted border-slate-300 pb-1">
                        <span class="font-bold w-32 shrink-0 text-slate-600 uppercase text-xs tracking-wide">Contact</span> 
                        <span class="font-medium text-base">{{ d.demographics.phone1 }}</span>
                      </div>
                    }
                 </div>

                 <!-- Vitals Strip -->
                 @if (d.examination.height || d.examination.weight) {
                   <div class="bg-slate-100 border-t-2 border-slate-800 p-4 grid grid-cols-4 gap-4 text-sm text-center print:bg-white print:border-t print:border-black">
                      <div>
                        <span class="font-bold text-[10px] uppercase text-slate-500 block tracking-widest mb-1">Height</span> 
                        <span class="font-bold text-slate-900 text-lg">{{ d.examination.height }} <span class="text-xs font-normal text-slate-500">cm</span></span>
                      </div>
                      <div class="border-l border-slate-300">
                        <span class="font-bold text-[10px] uppercase text-slate-500 block tracking-widest mb-1">Weight</span> 
                        <span class="font-bold text-slate-900 text-lg">{{ d.examination.weight }} <span class="text-xs font-normal text-slate-500">kg</span></span>
                      </div>
                      <div class="border-l border-slate-300">
                        <span class="font-bold text-[10px] uppercase text-slate-500 block tracking-widest mb-1">BMI</span> 
                        <span class="font-bold text-slate-900 text-lg">{{ d.examination.bmi }}</span>
                      </div>
                      <div class="border-l border-slate-300">
                        <span class="font-bold text-[10px] uppercase text-slate-500 block tracking-widest mb-1">BP</span> 
                        <span class="font-bold text-slate-900 text-lg">{{ d.examination.bp || '--' }}</span>
                      </div>
                   </div>
                 }
               </div>
            }

            <!-- The AI Generated Content -->
            <div class="prose prose-slate max-w-none 
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900
              prose-h1:text-2xl prose-h1:border-b-2 prose-h1:border-slate-200 prose-h1:pb-2 prose-h1:mb-6
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-900 prose-h2:uppercase prose-h2:tracking-wide prose-h2:text-base
              prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-slate-800 prose-h3:font-bold
              prose-p:text-justify prose-p:leading-relaxed prose-p:mb-4 prose-p:text-slate-700
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-li:marker:text-blue-500">
               <div [innerHTML]="summaryText() | markdown"></div>
            </div>
            
            <!-- Footer Signature (Pushed to bottom) -->
            <div class="mt-auto pt-16 break-inside-avoid">
              <div class="flex justify-between items-end">
                <div class="text-xs text-slate-400 font-mono">
                  <p>Ref: {{ generateRefId() }}</p>
                  <p>Generated: {{ today | date:'medium' }}</p>
                  <p>System: EndoScribe AI v2.0</p>
                </div>
                <div class="text-right">
                   <!-- Signature Line -->
                   <div class="h-20 w-48 mb-2 flex flex-col justify-end">
                      <div class="border-b border-slate-800 w-full"></div>
                   </div>
                   <p class="font-bold text-slate-900 text-base uppercase">Consultant Endocrinologist</p>
                   <p class="text-xs text-slate-500 uppercase tracking-wider">Kurnool Medical College</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Print specific overrides to ensure the paper look translates to physical paper */
    @media print {
      :host { display: block; height: auto; overflow: visible; }
      .print-area { box-shadow: none; border: none; padding: 0 !important; margin: 0 !important; max-width: none !important; width: 100% !important; }
      /* Hide browser default headers/footers if possible (browser dependent) */
      @page { margin: 1.5cm; size: A4; }
      body { background: white; }
    }
  `]
})
export class SummaryPreviewComponent {
  summaryText = input.required<string>();
  patientData = input<any>(null);
  onEdit = output<void>();
  today = new Date();

  generateRefId(): string {
    return 'DSD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  printSummary() {
    window.print();
  }
}
