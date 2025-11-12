type ISODate = string;

export interface Education {
    school: string;
    degree: string;
    fieldOfStudy?: string;
    location?: string;
    startDate: ISODate;
    endDate?: ISODate | null;
    gpa?: string;
  }
  
  export interface Experience {
    title: string;
    company: string;
    location?: string;
    responsibilities: string[];
    startDate: ISODate;
    endDate?: ISODate | null;
  }
  
  export interface Project {
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
    startDate?: ISODate;
    endDate?: ISODate | null;
  }
  
  export interface Skill {
    name: string;
    level: string;
  }
  
  export interface Summary {
    summary?: string;
    objective?: string;
  }

  export interface Objective {
    objective?: string;
  }
  
  export interface Certification {
    name?: string;
    issuer?: string;
    date: ISODate;
    expirationDate?: ISODate;
    credentialId?: string;
    url?: string;
  }
  
  export interface Volunteer {
    org: string;
    role?: string;
    startDate?: ISODate;  // "YYYY-MM"
    endDate?: ISODate;    // or null if ongoing
    impact?: string[];   // bullet points
    url?: string;
  };
  
  export interface Leadership {
    org: string;
    position?: string;
    startDate?: ISODate;
    endDate?: ISODate;
    achievements?: string[];
  }
  
  export interface Publication {
    title: string;
    venue?: string;    // journal/conference/blog
    date?: ISODate;
    url?: string;
    summary?: string;
  };
  
  export interface AwardHonor {
    title: string;
    issuer?: string;
    date?: ISODate;
    description?: string;
  };
  
  export interface Reference {
    name: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
    relation?: string;   // e.g., "Manager", "Professor"
  };

  export interface Links {
    name: string;
    url: string;
  }

  export interface Course {
    name: string;
    url: string;
  }