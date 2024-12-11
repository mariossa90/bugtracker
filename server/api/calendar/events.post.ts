import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import { ClientSecretCredential } from '@azure/identity'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  console.log('Calendar API endpoint hit')
  const body = await readBody(event)
  console.log('Request body:', body)
  const { startDate, endDate } = body

  try {
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!
    )

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    })

    const client = Client.initWithMiddleware({
      authProvider
    })

    // Fetch directly from the absence calendar
    const events = await client.api('/users/Abwesenheitskalender@woojin.at/calendar/events')
      .filter(`start/dateTime ge '${startDate}' and end/dateTime le '${endDate}'`)
      .select('id,subject,start,end,isAllDay,showAs,organizer')
      .top(999)  // Maximum number of events per request
      .get()

    // Check if there are more pages
    let allEvents = [...events.value]
    let nextLink = events['@odata.nextLink']
    
    while (nextLink) {
      const moreEvents = await client.api(nextLink).get()
      allEvents = [...allEvents, ...moreEvents.value]
      nextLink = moreEvents['@odata.nextLink']
    }

    return allEvents
  } catch (error) {
    console.error('Graph API Error:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch calendar events'
    })
  }
}) 