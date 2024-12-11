interface MondayGraphQLQuery {
  query: string
  variables?: Record<string, unknown>
}

interface MondayApiResponse {
  data?: any
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
  console.log('Received request body:', body)

  if (!config.mondayApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Monday.com API key is not configured'
    })
  }

  if (!body?.query) {
    throw createError({
      statusCode: 400,
      message: 'GraphQL query is required'
    })
  }

  try {
    const mondayRequest = {
      query: body.query,
      variables: body.variables
    }
    console.log('Sending request to Monday.com:', mondayRequest)

    const response = await $fetch<MondayApiResponse>('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.mondayApiKey}`
      },
      body: JSON.stringify(mondayRequest)
    })
    
    console.log('Response from Monday.com:', response)

    if (response.errors?.length) {
      console.error('Monday.com GraphQL errors:', response.errors)
      throw createError({
        statusCode: 400,
        message: response.errors[0].message
      })
    }
    
    return response
  } catch (error: any) {
    console.error('Monday.com API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error fetching Monday.com data'
    })
  }
})
