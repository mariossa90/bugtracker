interface ParsedUser {
  name: string      // Full name as found in subject
  reason?: string   // Absence reason if found
}

export function parseSubject(subject: string): ParsedUser[] {
  // Remove extra whitespace and split on common separators
  const parts = subject
    .trim()
    .split(/[,+]+/)
    .map(part => part.trim())
    .filter(Boolean)

  const users: ParsedUser[] = []
  const commonReasons = ['Urlaub', 'Pflege', 'DR', 'Krank']
  let lastReason: string | undefined

  parts.forEach(part => {
    let name = part
    let reason = lastReason

    // Check for known reasons at the end
    commonReasons.forEach(knownReason => {
      if (part.endsWith(` ${knownReason}`)) {
        name = part.replace(` ${knownReason}`, '')
        reason = knownReason
        lastReason = knownReason // Remember reason for next users in list
      }
    })

    users.push({ name, reason })
  })

  return users
}

// User matching function
export function findMatchingUser(parsedName: string, storeUsers: any[]): any | null {
  // Clean up the parsed name
  const cleanName = parsedName
    .replace(/\./g, ' ')  // Replace dots with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase()

  // Get first initial and last name
  const [firstPart, ...lastParts] = cleanName.split(' ')
  const lastName = lastParts.join(' ')
  const firstInitial = firstPart.charAt(0)

  return storeUsers.find(user => {
    const userName = user.name.toLowerCase()
    
    // Direct match
    if (userName === cleanName) return true

    // Match by last name and first initial
    const [userFirst, ...userLast] = userName.split(' ')
    const userLastName = userLast.join(' ')
    const userFirstInitial = userFirst.charAt(0)

    return userLastName === lastName && userFirstInitial === firstInitial
  })
}

