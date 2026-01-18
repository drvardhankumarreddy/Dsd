
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownPipe } from '../pipes/markdown.pipe';

@Component({
  selector: 'app-summary-preview',
  standalone: true,
  imports: [CommonModule, MarkdownPipe],
  template: `
    <div class="h-full flex flex-col">
      <!-- Toolbar -->
      <div class="flex items-center justify-between p-4 border-b bg-white no-print">
        <h2 class="text-xl font-bold text-gray-800">Generated Summary</h2>
        <div class="flex gap-2">
          <button 
            (click)="onEdit.emit()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Edit Data
          </button>
          <button 
            (click)="printSummary()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-auto bg-gray-50 p-6 sm:p-8">
        <div class="mx-auto max-w-4xl bg-white shadow-lg p-10 min-h-[800px] print-area" id="print-section">
          <!-- Hospital Header -->
          <div class="border-b-2 border-blue-900 pb-4 mb-8 text-center">
            <h1 class="text-2xl font-serif font-bold text-blue-900 uppercase">Department of Endocrinology</h1>
            <p class="text-gray-800 font-bold text-lg mt-1 uppercase tracking-wide">Kurnool Medical College & GGH</p>
            <p class="text-gray-500 text-xs mt-1 uppercase tracking-widest">Kurnool, Andhra Pradesh</p>
          </div>

          <!-- Structured Patient Details -->
          @if (patientData(); as d) {
             <div class="mb-8 border border-gray-800">
               <div class="bg-blue-900 text-white p-2 font-bold text-center text-sm uppercase print:bg-gray-200 print:text-black">Patient Details</div>
               <div class="p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-900">
                  <div class="flex border-b border-gray-200 pb-1">
                    <span class="font-bold w-32 shrink-0 text-gray-700">Name:</span> 
                    <span>{{ d.demographics.name }}</span>
                  </div>
                  <div class="flex border-b border-gray-200 pb-1">
                    <span class="font-bold w-32 shrink-0 text-gray-700">Age / DOB:</span> 
                    <span>{{ d.demographics.age }} / {{ d.demographics.dob }}</span>
                  </div>
                  <div class="flex border-b border-gray-200 pb-1">
                    <span class="font-bold w-32 shrink-0 text-gray-700">UHID:</span> 
                    <span>{{ d.demographics.uhid || 'N/A' }}</span>
                  </div>
                  <div class="flex border-b border-gray-200 pb-1">
                    <span class="font-bold w-32 shrink-0 text-gray-700">Sex (Birth):</span> 
                    <span>{{ d.demographics.sexAssigned }}</span>
                  </div>
                  <div class="flex border-b border-gray-200 pb-1">
                    <span class="font-bold w-32 shrink-0 text-gray-700">Gender (Rearing):</span> 
                    <span>{{ d.demographics.currentGender }}</span>
                  </div>
                  @if(d.demographics.phone1){
                    <div class="flex border-b border-gray-200 pb-1">
                      <span class="font-bold w-32 shrink-0 text-gray-700">Phone:</span> 
                      <span>{{ d.demographics.phone1 }}</span>
                    </div>
                  }
               </div>
               @if (d.examination.height || d.examination.weight) {
                 <div class="bg-gray-50 border-t border-gray-800 p-3 grid grid-cols-4 gap-4 text-sm text-center">
                    <div><span class="font-bold text-xs uppercase text-gray-500 block">Height</span> {{ d.examination.height }} cm</div>
                    <div><span class="font-bold text-xs uppercase text-gray-500 block">Weight</span> {{ d.examination.weight }} kg</div>
                    <div><span class="font-bold text-xs uppercase text-gray-500 block">BMI</span> {{ d.examination.bmi }}</div>
                    <div><span class="font-bold text-xs uppercase text-gray-500 block">BP</span> {{ d.examination.bp }}</div>
                 </div>
               }
             </div>
          }

          <!-- The Content -->
          <div class="prose prose-blue max-w-none prose-headings:font-serif prose-h2:text-blue-800 prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-p:leading-relaxed prose-p:text-justify">
             <div [innerHTML]="summaryText() | markdown"></div>
          </div>
          
          <!-- Footer Signature -->
          <div class="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end break-inside-avoid">
            <div>
              <p class="text-sm text-gray-500">Generated on {{ today | date:'mediumDate' }} via EndoScribe AI</p>
            </div>
            <div class="text-right">
              <div class="h-16 border-b border-gray-400 w-48 mb-2"></div>
              <p class="font-bold text-gray-800">Consultant Endocrinologist</p>
              <p class="text-sm text-gray-600">Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media print {
      :host { display: block; height: auto; overflow: visible; }
      .print-area { box-shadow: none; border: none; padding: 0; }
    }
  `]
})
export class SummaryPreviewComponent {
  summaryText = input.required<string>();
  patientData = input<any>(null);
  onEdit = output<void>();
  today = new Date();

  printSummary() {
    window.print();
  }
}
