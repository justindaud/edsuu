/**
 * Central registry of UI media locations throughout the application
 * This file defines all possible locations where media can be placed on the public site.
 */

// Media locations registry with metadata
export const uiMediaLocations = {
  // Home page hero sections
  'home.hero.edsu': { 
    title: 'Home - EDSU Hero Banner', 
    description: 'Hero image for EDSU section on homepage',
    defaultPath: '/images/placeholder/edsu1.jpg'
  },
  'home.hero.tokobuku': { 
    title: 'Home - Tokobuku Banner', 
    description: 'Hero image for Tokobuku section',
    defaultPath: '/images/placeholder/book1.jpg'
  },
  'home.hero.merchandise': { 
    title: 'Home - Merchandise Banner', 
    description: 'Hero image for Merchandise section',
    defaultPath: '/images/placeholder/merch1.jpg'
  },
  'home.hero.program': { 
    title: 'Home - Program Banner', 
    description: 'Fallback hero image for Programs section when no active program',
    defaultPath: '/placeholder/program1.jpg'
  },
  
  // EDSU House page
  'edsu.hero.1': { 
    title: 'EDSU - Hero Image 1', 
    description: 'First hero image on EDSU page',
    defaultPath: '/placeholder/edsu1.jpg'
  },
  'edsu.hero.2': { 
    title: 'EDSU - Hero Image 2', 
    description: 'Second hero image on EDSU page',
    defaultPath: '/placeholder/edsu2.jpg'
  },
  'edsu.gallery.white-space.1': { 
    title: 'EDSU - White Space Image 1', 
    description: 'First gallery image for White Space section',
    defaultPath: '/placeholder/white-space1.jpg'
  },
  'edsu.gallery.white-space.2': { 
    title: 'EDSU - White Space Image 2', 
    description: 'Second gallery image for White Space section',
    defaultPath: '/placeholder/white-space2.jpg'
  },
  'edsu.gallery.black-box.1': { 
    title: 'EDSU - Black Box Image 1', 
    description: 'First gallery image for Black Box section',
    defaultPath: '/placeholder/black-box1.jpg'
  },
  'edsu.gallery.black-box.2': { 
    title: 'EDSU - Black Box Image 2', 
    description: 'Second gallery image for Black Box section',
    defaultPath: '/placeholder/black-box2.jpg'
  },
  'edsu.entrance.1': { 
    title: 'EDSU - Entrance Image 1', 
    description: 'First entrance section image',
    defaultPath: '/placeholder/entrance1.jpg'
  },
  'edsu.entrance.2': { 
    title: 'EDSU - Entrance Image 2', 
    description: 'Second entrance section image',
    defaultPath: '/placeholder/entrance2.jpg'
  },
  
  // EDSU Compound sections
  'edsu.compound.uttara.1': { 
    title: 'EDSU - Uttara Image 1', 
    description: 'First Uttara section image',
    defaultPath: '/placeholder/uttara1.jpg'
  },
  'edsu.compound.uttara.2': { 
    title: 'EDSU - Uttara Image 2', 
    description: 'Second Uttara section image',
    defaultPath: '/placeholder/uttara2.jpg'
  },
  'edsu.compound.pulang.1': { 
    title: 'EDSU - Pulang Image 1', 
    description: 'First Pulang section image',
    defaultPath: '/placeholder/pulang1.jpg'
  },
  'edsu.compound.pulang.2': { 
    title: 'EDSU - Pulang Image 2', 
    description: 'Second Pulang section image',
    defaultPath: '/placeholder/pulang2.jpg'
  },
  'edsu.compound.omong.1': { 
    title: 'EDSU - Omong Image 1', 
    description: 'First Omong section image',
    defaultPath: '/placeholder/omong1.jpg'
  },
  'edsu.compound.omong.2': { 
    title: 'EDSU - Omong Image 2', 
    description: 'Second Omong section image',
    defaultPath: '/placeholder/omong2.jpg'
  },
  'edsu.compound.music.1': { 
    title: 'EDSU - Music Bar Image 1', 
    description: 'First Music Bar section image',
    defaultPath: '/placeholder/music1.jpg'
  },
  'edsu.compound.music.2': { 
    title: 'EDSU - Music Bar Image 2', 
    description: 'Second Music Bar section image',
    defaultPath: '/placeholder/music2.jpg'
  },
  
  // Tokobuku page
  'tokobuku.be-em': { 
    title: 'Tokobuku - Be Em Image', 
    description: 'Image for Be Em section on Tokobuku page',
    defaultPath: '/placeholder/be-em.jpg'
  },
  'tokobuku.party-literasi': { 
    title: 'Tokobuku - Party Literasi Image', 
    description: 'Image for Party Literasi section on Tokobuku page',
    defaultPath: '/placeholder/party-literasi.jpg'
  },
  
  // Party Literasi page
  'party-literasi.1': { 
    title: 'Party Literasi - Image 1', 
    description: 'First image on Party Literasi page',
    defaultPath: '/placeholder/party1.jpg'
  },
  'party-literasi.2': { 
    title: 'Party Literasi - Image 2', 
    description: 'Second image on Party Literasi page',
    defaultPath: '/placeholder/party2.jpg'
  }
} as const;

// Type for location IDs to ensure type safety when using them
export type UIMediaLocationId = keyof typeof uiMediaLocations; 