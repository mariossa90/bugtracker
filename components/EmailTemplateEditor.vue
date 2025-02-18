<template>
  <div class="email-template-editor">
    <!-- Template Selection -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div 
        v-for="template in emailTemplateStore.templates" 
        :key="template.id"
        @click="selectTemplate(template.type)"
        class="p-4 rounded-lg border cursor-pointer transition-colors"
        :class="[
          selectedType === template.type 
            ? 'border-[#5bbcaa] bg-[#5bbcaa]/5 dark:bg-[#5bbcaa]/10' 
            : 'border-gray-200 dark:border-gray-700 hover:border-[#5bbcaa] hover:bg-[#5bbcaa]/5 dark:hover:bg-[#5bbcaa]/10'
        ]"
      >
        <h3 class="font-medium text-light-text-primary dark:text-white mb-1">{{ template.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ template.type === 'weekly_summary' ? 'Weekly report of time tracking issues' : 'Single day notification' }}
        </p>
      </div>
    </div>

    <div v-if="selectedTemplate" class="grid grid-cols-2 gap-6">
      <!-- Edit Panel -->
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-light-text-primary dark:text-white mb-2">Subject</label>
          <input 
            v-model="draftTemplate.subject"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-light-text-primary dark:text-white"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-light-text-primary dark:text-white mb-2">Body</label>
          <textarea
            v-model="draftTemplate.body"
            rows="10"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-light-text-primary dark:text-white font-mono text-sm"
          ></textarea>
        </div>

        <!-- Variables -->
        <div>
          <label class="block text-sm font-medium text-light-text-primary dark:text-white mb-2">Available Variables</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="variable in selectedTemplate.variables"
              :key="variable"
              @click="insertVariable(variable)"
              class="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ variable }}
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 class="text-sm font-medium text-light-text-primary dark:text-white mb-4">Preview</h3>
        <div class="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject: {{ previewSubject }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {{ previewBody }}
          </div>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Note: This is a preview with sample data. Actual emails will use real values.
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button 
        @click="resetCurrentTemplate"
        class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        Reset to Default
      </button>
      <button 
        @click="saveTemplate"
        class="px-4 py-2 rounded-lg text-sm font-medium bg-[#5bbcaa] text-white hover:bg-[#4aa899] transition-colors"
        :disabled="!hasChanges"
      >
        Save Changes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEmailTemplateStore, type EmailTemplate } from '~/stores/emailTemplates'

const emailTemplateStore = useEmailTemplateStore()
const selectedType = ref<EmailTemplate['type'] | null>(null)
const draftTemplate = ref<Partial<EmailTemplate>>({})

// Sample data for preview
const sampleData = {
  firstName: 'John',
  date: 'Mon, Jan 15',
  timeLogged: '3h 30m',
  goalHours: '8',
  periodType: 'weekly',
  issueCount: '3',
  isPlural: 'are',
  issueText: 'issues',
  needsS: '',
  missedGoalsSection: 'Missed Goals (2):\n• Mon, Jan 15: Logged 3h 30m (8h goal not met)\n• Tue, Jan 16: Logged 4h 15m (8h goal not met)\n\n',
  exceededGoalsSection: 'Exceeded Goals (1):\n• Wed, Jan 17: Logged 16h 45m (exceeds 8h goal)\n\n',
  overtimeNote: '\nIf the overtime entries are correct, please make sure to maintain a healthy work-life balance.'
}

const selectedTemplate = computed(() => {
  if (!selectedType.value) return null
  return emailTemplateStore.getTemplateByType(selectedType.value)
})

const hasChanges = computed(() => {
  if (!selectedTemplate.value) return false
  return draftTemplate.value.subject !== selectedTemplate.value.subject ||
         draftTemplate.value.body !== selectedTemplate.value.body
})

const previewSubject = computed(() => {
  if (!draftTemplate.value.subject) return ''
  return emailTemplateStore.replaceVariables({
    ...selectedTemplate.value!,
    subject: draftTemplate.value.subject,
    body: ''
  }, sampleData).subject
})

const previewBody = computed(() => {
  if (!draftTemplate.value.body) return ''
  return emailTemplateStore.replaceVariables({
    ...selectedTemplate.value!,
    subject: '',
    body: draftTemplate.value.body
  }, sampleData).body
})

function selectTemplate(type: EmailTemplate['type']) {
  selectedType.value = type
  const template = emailTemplateStore.getTemplateByType(type)
  if (template) {
    draftTemplate.value = {
      subject: template.subject,
      body: template.body
    }
  }
}

function insertVariable(variable: string) {
  // Get the textarea element
  const textarea = document.querySelector('textarea')
  if (!textarea) return

  const { selectionStart, selectionEnd } = textarea
  const currentValue = draftTemplate.value.body || ''
  
  // Insert the variable at cursor position
  draftTemplate.value.body = 
    currentValue.substring(0, selectionStart) +
    variable +
    currentValue.substring(selectionEnd)
    
  // Reset cursor position after the inserted variable
  setTimeout(() => {
    textarea.setSelectionRange(
      selectionStart + variable.length,
      selectionStart + variable.length
    )
    textarea.focus()
  })
}

function saveTemplate() {
  if (!selectedTemplate.value || !draftTemplate.value.subject || !draftTemplate.value.body) return
  
  emailTemplateStore.saveCustomTemplate({
    ...selectedTemplate.value,
    subject: draftTemplate.value.subject,
    body: draftTemplate.value.body
  })
}

function resetCurrentTemplate() {
  if (!selectedType.value) return
  emailTemplateStore.resetTemplateToDefault(selectedType.value)
  
  // Refresh the draft with the default template
  const template = emailTemplateStore.getTemplateByType(selectedType.value)
  if (template) {
    draftTemplate.value = {
      subject: template.subject,
      body: template.body
    }
  }
}

// Load any persisted templates when component mounts
emailTemplateStore.loadPersistedTemplates()
</script>

<style scoped>
.email-template-editor {
  max-width: 1200px;
  margin: 0 auto;
}

textarea {
  resize: vertical;
  min-height: 200px;
}
</style> 