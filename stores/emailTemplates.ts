import { defineStore } from 'pinia'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  type: 'daily_missed' | 'daily_overtime' | 'weekly_summary'
}

interface EmailTemplateState {
  templates: EmailTemplate[]
  customTemplates: EmailTemplate[]
}

export const useEmailTemplateStore = defineStore('emailTemplates', {
  state: (): EmailTemplateState => ({
    templates: [
      {
        id: 'daily_missed_default',
        name: 'Daily Missed Goal',
        subject: '[Monday] Missed Work Goal on {date}',
        body: 'Hi {firstName},\n\nI noticed that you logged {timeLogged} on {date}, which is below the daily goal of {goalHours}h.\nPlease make sure to log your time accurately.\n\nBest regards',
        variables: ['{firstName}', '{date}', '{timeLogged}', '{goalHours}'],
        type: 'daily_missed'
      },
      {
        id: 'daily_overtime_default',
        name: 'Daily Overtime Notice',
        subject: '[Monday] Overtime Notice for {date}',
        body: 'Hi {firstName},\n\nI noticed that you logged {timeLogged} on {date}, which is more than double the daily goal of {goalHours}h. Please check if you forgot to stop the timer on a ticket, or if its correct make sure to maintain a healthy work-life balance.\n\nBest regards',
        variables: ['{firstName}', '{date}', '{timeLogged}', '{goalHours}'],
        type: 'daily_overtime'
      },
      {
        id: 'weekly_summary_default',
        name: 'Weekly Summary',
        subject: '[Monday] Time Tracking Issues - {periodType} Summary',
        body: 'Hi {firstName},\n\nThere are some time tracking discrepancies found in your {periodType} entries. There {isPlural} {issueCount} {issueText} that need{needsS} your attention:\n\n{missedGoalsSection}{exceededGoalsSection}\nPlease:\n1. Review these entries for accuracy\n2. Update any incorrect time logs\n3. Ensure all timers are properly stopped\n\n{overtimeNote}\n\nBest regards',
        variables: [
          '{firstName}',
          '{periodType}',
          '{issueCount}',
          '{isPlural}',
          '{issueText}',
          '{needsS}',
          '{missedGoalsSection}',
          '{exceededGoalsSection}',
          '{overtimeNote}'
        ],
        type: 'weekly_summary'
      }
    ],
    customTemplates: []
  }),

  getters: {
    getTemplateByType: (state) => {
      return (type: EmailTemplate['type']) => {
        // First check for custom template
        const customTemplate = state.customTemplates.find(t => t.type === type)
        if (customTemplate) return customTemplate

        // Fallback to default template
        return state.templates.find(t => t.type === type)
      }
    },

    getAllTemplates: (state) => {
      return [...state.templates, ...state.customTemplates]
    }
  },

  actions: {
    saveCustomTemplate(template: EmailTemplate) {
      const existingIndex = this.customTemplates.findIndex(t => t.type === template.type)
      
      if (existingIndex !== -1) {
        // Update existing template
        this.customTemplates[existingIndex] = template
      } else {
        // Add new template
        this.customTemplates.push(template)
      }

      // Persist to localStorage
      this.persistTemplates()
    },

    resetTemplateToDefault(type: EmailTemplate['type']) {
      const defaultTemplate = this.templates.find(t => t.type === type)
      if (!defaultTemplate) return

      // Remove custom template if it exists
      this.customTemplates = this.customTemplates.filter(t => t.type !== type)
      
      // Persist changes
      this.persistTemplates()
    },

    persistTemplates() {
      localStorage.setItem('emailTemplates', JSON.stringify(this.customTemplates))
    },

    loadPersistedTemplates() {
      const stored = localStorage.getItem('emailTemplates')
      if (stored) {
        try {
          this.customTemplates = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to load persisted email templates:', e)
        }
      }
    },

    // Helper function to replace variables in templates
    replaceVariables(template: EmailTemplate, variables: Record<string, string>): { subject: string, body: string } {
      let subject = template.subject
      let body = template.body

      // Replace all variables in both subject and body
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`
        subject = subject.replace(new RegExp(placeholder, 'g'), value)
        body = body.replace(new RegExp(placeholder, 'g'), value)
      })

      return { subject, body }
    }
  }
}) 