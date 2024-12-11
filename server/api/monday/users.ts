interface MondayGraphQLQuery {
  query: string
  variables?: Record<string, unknown>
}

interface MondayApiResponse {
  data?: {
    users?: Array<{
      id: string
      name: string
      email: string
      photo_original: string
      photo_thumb: string
      photo_thumb_small: string
      photo_tiny: string
    }>
  }
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
  }>
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<MondayGraphQLQuery>(event)

  if (!config.mondayApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Monday.com API key is not configured'
    })
  }

  if (!body?.query) {
    throw createError({
      statusCode: 400,
      message: 'Query is required'
    })
  }

  try {
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.mondayApiKey}`
      },
      body: JSON.stringify(body)
    })

    const data: MondayApiResponse = await response.json()

    if (data.errors?.length) {
      throw createError({
        statusCode: 400,
        message: data.errors[0].message
      })
    }

    return data
  } catch (error) {
    console.error('Error fetching Monday.com users:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch users from Monday.com'
    })
  }
})
