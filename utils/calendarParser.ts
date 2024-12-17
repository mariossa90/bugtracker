interface ParsedUser {
  name: string;
  reason: string | null;
}

export function parseSubject(subject: string): ParsedUser[] {
  // Remove any extra whitespace and split by both comma and plus
  const parts = subject.split(/[,+]/).map(part => part.trim());
  
  return parts.map(part => {
    // Look for reason at the end of each part, case insensitive for all reasons
    const reasonMatch = part.match(/\s+(DR|[Uu]rlaub|[Kk]rank|[Pp]flege)$/i);
    const reason = reasonMatch ? reasonMatch[1] : null;
    
    // Remove the reason from the name if found
    const name = reason 
      ? part.slice(0, part.length - reason.length).trim() 
      : part.trim();
    
    return {
      name,
      reason: reason ? reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase() : null
    };
  });
}

// User matching function
export function findMatchingUser(parsedName: string, storeUsers: any[]): any | null {
  // Clean up the parsed name
  const cleanName = parsedName
    .replace(/\./g, ' ')  // Replace dots with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase()

  // Try different matching strategies
  return storeUsers.find(user => {
    const userName = user.name.toLowerCase()
    
    // 1. Direct match
    if (userName === cleanName) return true

    // 2. Last name only match (primary matching strategy)
    const parsedParts = cleanName.split(' ')
    const parsedLastName = parsedParts[parsedParts.length - 1]
    const userParts = userName.split(' ')
    const userLastName = userParts[userParts.length - 1]
    
    // If last names match exactly, consider it a match
    // This would match "HH Wagner" with "Richard Wagner"
    if (parsedLastName === userLastName) return true

    // 3. Handle compound last names or abbreviated versions
    if (userLastName.includes(parsedLastName) || parsedLastName.includes(userLastName)) {
      // Additional check for very short names to prevent false matches
      if (parsedLastName.length < 3) return false
      return true
    }

    return false
  })
}

