import {
  UserProfile,
  Post,
  Opportunity,
  RichfieldEvent,
  AlumniCareerTrajectory,
  NotificationItem
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-student-1',
    email: 'thabo.molefe@my.richfield.ac.za',
    name: 'Thabo Molefe',
    role: 'student',
    verificationStatus: 'verified',
    verificationId: 'RF-2023-8841',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    headline: 'Final Year BSc IT Scholar | Cloud & Full-Stack Enthusiast',
    summary: 'Third-year Information Technology student at Richfield Braamfontein Campus. Passionate about cloud computing (AWS/Azure), scalable web APIs, and building solutions for South African fintech.',
    programme: 'BSc Information Technology',
    campus: 'Braamfontein Campus, Johannesburg',
    enrolmentYear: 2023,
    graduationYear: 2026,
    technicalSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS Fundamentals', 'Python', 'Tailwind CSS'],
    professionalSkills: ['Problem Solving', 'Agile Teamwork', 'Effective Communication', 'Project Presentation'],
    endorsements: [
      { skill: 'React', count: 8, endorsedBy: ['Lerato Khumalo', 'Dr. Dlamini', 'Kagiso Zulu'] },
      { skill: 'TypeScript', count: 6, endorsedBy: ['Lerato Khumalo', 'Sarah Jenkins'] },
      { skill: 'PostgreSQL', count: 5, endorsedBy: ['Dr. Dlamini'] },
    ],
    workExperience: [
      {
        id: 'exp-1',
        role: 'Peer Programming Tutor & Lab Assistant',
        company: 'Richfield College IT Department',
        period: 'Feb 2024 - Present',
        description: 'Assisting 1st and 2nd year students with Object-Oriented Programming and Relational Database design.',
        type: 'internship'
      },
      {
        id: 'exp-2',
        role: 'Junior Frontend Intern',
        company: 'Soweto Youth Tech Incubator',
        period: 'Dec 2024 - Jan 2025',
        description: 'Constructed responsive dashboards for local retail entrepreneurs using React and Supabase.',
        type: 'industry_placement'
      }
    ],
    portfolioLinks: {
      github: 'https://github.com/thabo-molefe',
      linkedin: 'https://linkedin.com/in/thabo-richfield-it',
      credly: 'https://credly.com/users/thabo-molefe',
      website: 'https://thabo-dev.co.za'
    },
    digitalBadges: [
      {
        id: 'badge-1',
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: 'Jan 2025',
        category: 'Cloud'
      },
      {
        id: 'badge-2',
        title: 'Richfield Dean’s Academic Merit Badge',
        issuer: 'Richfield Academic Council',
        issueDate: 'Nov 2024',
        category: 'Academic'
      },
      {
        id: 'badge-3',
        title: 'Python for Data Science Specialization',
        issuer: 'Coursera / IBM',
        issueDate: 'Jul 2024',
        category: 'Data'
      }
    ],
    achievements: [
      {
        id: 'ach-1',
        title: '1st Runner Up - Richfield Inter-Campus Hackathon 2024',
        category: 'hackathon',
        year: '2024',
        description: 'Built a USSD mobile micro-savings solution for township spaza shops.'
      },
      {
        id: 'ach-2',
        title: 'Richfield Merit Bursary Recipient',
        category: 'scholarship',
        year: '2023',
        description: 'Awarded for maintaining 85%+ aggregate across computer science modules.'
      }
    ],
    clubsSocieties: ['Richfield Developer Student Club (Lead)', 'Enrich Tech Mentorship Society'],
    careerInterests: ['Cloud Architecture', 'Full-Stack Engineering', 'Fintech Security', 'DevOps'],
    careerAspirations: 'To join an enterprise graduate programme in Gauteng, obtain AWS Solutions Architect certification, and mentor junior Richfield students.',
    cvFileName: 'Thabo_Molefe_CV_2026.pdf',
    profileCompleteness: 88
  },
  {
    id: 'user-alumni-1',
    email: 'lerato.khumalo@alumni.richfield.ac.za',
    name: 'Lerato Khumalo',
    role: 'alumni',
    verificationStatus: 'verified',
    verificationId: 'RF-ALUM-2021-049',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    headline: 'Senior Cloud Solutions Architect @ Vodacom | Richfield Class of 2021',
    summary: 'Richfield Pretoria Campus Alumna (BSc IT cum laude). Now driving enterprise cloud transformation and microservice modernization at Vodacom SA. Active mentor for Richfield undergraduates.',
    programme: 'BSc Information Technology (Cum Laude)',
    campus: 'Pretoria Campus',
    enrolmentYear: 2018,
    graduationYear: 2021,
    currentCompany: 'Vodacom South Africa',
    currentRole: 'Senior Cloud Solutions Architect',
    technicalSkills: ['AWS', 'Kubernetes', 'Terraform', 'Go', 'Microservices', 'Enterprise Architecture'],
    professionalSkills: ['Executive Stakeholder Management', 'Technical Mentorship', 'Systems Design'],
    endorsements: [
      { skill: 'AWS', count: 24, endorsedBy: ['Vodacom Engineers', 'Dr. Dlamini'] },
      { skill: 'Kubernetes', count: 18, endorsedBy: ['Tech Industry Peers'] }
    ],
    workExperience: [
      {
        id: 'exp-al-1',
        role: 'Senior Cloud Solutions Architect',
        company: 'Vodacom South Africa',
        period: '2023 - Present',
        description: 'Leading multi-region AWS cloud migration projects and containerized billing microservices.',
        type: 'full_time'
      },
      {
        id: 'exp-al-2',
        role: 'Graduate Cloud Engineer',
        company: 'Vodacom South Africa',
        period: '2021 - 2023',
        description: 'Rotational programme in DevOps, CI/CD pipelines, and cloud security monitoring.',
        type: 'learnership'
      }
    ],
    portfolioLinks: {
      linkedin: 'https://linkedin.com/in/lerato-khumalo-cloud',
      github: 'https://github.com/lerato-cloud'
    },
    digitalBadges: [
      {
        id: 'badge-al-1',
        title: 'AWS Certified Solutions Architect - Professional',
        issuer: 'Amazon Web Services',
        issueDate: '2023',
        category: 'Cloud'
      }
    ],
    achievements: [
      {
        id: 'ach-al-1',
        title: 'Top Graduating IT Scholar Trophy',
        category: 'award',
        year: '2021',
        description: 'Recognized by Richfield College Senate for highest aggregate graduation mark.'
      }
    ],
    clubsSocieties: ['Richfield Alumni Mentorship Network (Founding Member)'],
    careerInterests: ['Enterprise Cloud', 'Telecom AI Infrastructure'],
    careerAspirations: 'Empower 100+ Richfield graduates into high-impact tech careers across the African continent.',
    profileCompleteness: 95
  },
  {
    id: 'user-business-1',
    email: 'sarah.jenkins@standardbank.co.za',
    name: 'Sarah Jenkins',
    role: 'business',
    verificationStatus: 'verified',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
    headline: 'Head of Early Tech Talent & Graduate Programmes @ Standard Bank Group',
    summary: 'Connecting ambitious students and graduates from leading institutions like Richfield College to career opportunities across banking, software engineering, and analytics.',
    campus: 'Johannesburg Corporate Office',
    technicalSkills: ['Talent Sourcing', 'Technical Assessment', 'Graduate Development'],
    professionalSkills: ['Interviewing', 'Leadership Coaching'],
    endorsements: [],
    workExperience: [],
    portfolioLinks: {
      linkedin: 'https://linkedin.com/in/sarah-jenkins-talent',
      website: 'https://jobs.standardbank.com'
    },
    digitalBadges: [],
    achievements: [],
    clubsSocieties: [],
    careerInterests: [],
    careerAspirations: '',
    profileCompleteness: 90,
    businessDetails: {
      organizationName: 'Standard Bank Group',
      industry: 'Banking & Financial Technology',
      companyDescription: 'Africa’s largest bank by assets, operating across 20 countries. Leading digital transformation and cloud-first financial services.',
      location: 'Rosebank, Johannesburg, South Africa',
      website: 'https://www.standardbank.co.za',
      contactEmail: 'graduates@standardbank.co.za',
      contactPhone: '+27 11 636 9111',
      registrationNumber: '1962/000738/06',
      approvalStatus: 'approved',
      talentRequirements: [
        'BSc IT / Computer Science graduates',
        'BCom Information Systems',
        'Diploma in IT & Software Development',
        'Problem-solving & teamwork aptitude'
      ]
    }
  },
  {
    id: 'user-admin-1',
    email: 'admin@richfield.ac.za',
    name: 'Dr. Khulekani Dlamini',
    role: 'admin',
    verificationStatus: 'verified',
    verificationId: 'RF-ADMIN-001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    headline: 'Dean of Student Affairs & Industry Placements @ Richfield College',
    summary: 'Overseeing graduate employment outcomes, industry accreditation, and campus partnership initiatives across all Richfield & AAA College campuses.',
    campus: 'Richfield Executive Campus, Bryanston',
    technicalSkills: ['Academic Administration', 'Curriculum Industry Alignment', 'Policy Governance'],
    professionalSkills: ['Higher Education Leadership', 'Strategic Partnerships'],
    endorsements: [],
    workExperience: [],
    portfolioLinks: {},
    digitalBadges: [],
    achievements: [],
    clubsSocieties: [],
    careerInterests: [],
    careerAspirations: '',
    profileCompleteness: 100
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    companyId: 'comp-standardbank',
    companyName: 'Standard Bank Group',
    companyLogo: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=100&h=100&fit=crop',
    title: 'Graduate Software Engineer (2026 Cohort)',
    type: 'graduate_vacancy',
    location: 'Johannesburg (Hybrid)',
    isRemote: false,
    campusTarget: 'All Richfield Campuses',
    requiredProgramme: ['BSc Information Technology', 'BSc Computer Science', 'Diploma in IT'],
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git'],
    description: 'Join Standard Bank’s award-winning Technology Graduate Programme. You will rotate through agile engineering pods building secure cloud banking apps, microservices, and modern web applications.',
    responsibilities: [
      'Collaborate with Senior Engineers on production retail banking features',
      'Participate in agile sprints, daily standups, and peer code reviews',
      'Gain hands-on certification in AWS and containerized architectures'
    ],
    stipendSalary: 'R28,000 - R32,000 / month',
    closingDate: '30 October 2026',
    status: 'approved',
    applicantsCount: 42,
    matchScore: 94
  },
  {
    id: 'opp-2',
    companyId: 'comp-vodacom',
    companyName: 'Vodacom South Africa',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop',
    title: 'Cloud & DevOps Learnership (12 Months)',
    type: 'learnership',
    location: 'Midrand, Gauteng',
    isRemote: false,
    campusTarget: 'Braamfontein, Pretoria, Centenary',
    requiredProgramme: ['BSc Information Technology', 'Diploma in Network Systems', 'Diploma in IT'],
    requiredSkills: ['Linux', 'Cloud Fundamentals', 'Python', 'Networking'],
    description: 'An accredited 12-month learnership programme in partnership with AWS and Vodacom. Combines structured classroom training with practical infrastructure rotations.',
    responsibilities: [
      'Support cloud monitoring and automated deployment workflows',
      'Learn Terraform, Docker, and AWS Serverless infrastructure',
      'Prepare for official AWS Cloud Practitioner and SysOps certifications'
    ],
    stipendSalary: 'R14,500 / month + Certification Coverage',
    closingDate: '15 November 2026',
    status: 'approved',
    applicantsCount: 38,
    matchScore: 89
  },
  {
    id: 'opp-3',
    companyId: 'comp-entelect',
    companyName: 'Entelect Software',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
    title: 'Junior Web & Mobile Developer Intern',
    type: 'internship',
    location: 'Melrose Arch, Johannesburg (Hybrid)',
    isRemote: false,
    campusTarget: 'Braamfontein & Pretoria',
    requiredProgramme: ['BSc Information Technology', 'Diploma in Software Development'],
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    description: 'Work alongside bespoke software consultancy teams crafting mission-critical platforms for leading South African enterprises.',
    responsibilities: [
      'Build responsive, accessible user interfaces using modern React and TypeScript',
      'Write clean, maintainable unit tests and documentation',
      'Contribute to internal innovation hackathons'
    ],
    stipendSalary: 'R16,000 / month',
    closingDate: '25 October 2026',
    status: 'approved',
    applicantsCount: 29,
    matchScore: 96
  },
  {
    id: 'opp-4',
    companyId: 'comp-discovery',
    companyName: 'Discovery Limited',
    companyLogo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=100&fit=crop',
    title: 'Part-Time Campus Tech Ambassador',
    type: 'part_time',
    location: 'On Campus (Flexible Hours)',
    isRemote: true,
    campusTarget: 'Braamfontein, Durban, Cape Town',
    requiredProgramme: ['Any Richfield IT or Business Programme'],
    requiredSkills: ['Public Speaking', 'Social Media', 'Organizing Events'],
    description: 'Represent Discovery Vitality on your Richfield campus. Coordinate student hackathon sponsorships, distribute innovation challenges, and organize tech talks.',
    responsibilities: [
      'Organize 2 tech discovery workshops per semester',
      'Engage student societies and peer developers',
      'Provide monthly campus sentiment reports'
    ],
    stipendSalary: 'R5,500 / month (15 hours/week)',
    closingDate: '10 December 2026',
    status: 'approved',
    applicantsCount: 15,
    matchScore: 80
  },
  {
    id: 'opp-5',
    companyId: 'comp-techfin',
    companyName: 'TechFin Solutions SA',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
    title: 'Fintech Data Analyst Intern',
    type: 'internship',
    location: 'Cape Town / Remote',
    isRemote: true,
    campusTarget: 'Cape Town Campus',
    requiredProgramme: ['BSc IT', 'BCom Accounting', 'Diploma in IT'],
    requiredSkills: ['SQL', 'Python', 'Excel / PowerBI'],
    description: 'Support our transactional data engineering squad with data cleansing, automated pipeline monitoring, and dashboard generation.',
    responsibilities: [
      'Query relational databases using optimized SQL statements',
      'Prepare merchant transaction dashboards for compliance'
    ],
    stipendSalary: 'R15,000 / month',
    closingDate: '05 November 2026',
    status: 'pending_approval', // Needs admin approval!
    applicantsCount: 0,
    matchScore: 85
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-student-1',
    authorName: 'Thabo Molefe',
    authorRole: 'student',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    authorHeadline: 'Final Year BSc IT Scholar @ Braamfontein Campus',
    campus: 'Braamfontein Campus',
    timestamp: '2 hours ago',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
    videoDuration: '0:45',
    content: '🚀 Quick 45-second pitch of our final-year Richfield Capstone Project! We engineered a real-time micro-finance tracking system for small businesses in Braamfontein using React, TypeScript, and AWS Lambda. Special thanks to our lecturer Mr. Ndlovu for the architecture guidance! Feedback welcome from any alumni or recruiters!',
    tags: ['RichfieldCapstone', 'BScIT', 'WebDev', 'StudentShowcase', 'AWS'],
    likes: 34,
    hasLiked: false,
    targetAudience: 'all',
    comments: [
      {
        id: 'c-1',
        authorId: 'user-alumni-1',
        authorName: 'Lerato Khumalo',
        authorRole: 'alumni',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
        content: 'Impressive architecture Thabo! Happy to do a 15-minute 1-on-1 code review with you this Thursday if you want cloud optimization tips.',
        timestamp: '1 hour ago'
      },
      {
        id: 'c-2',
        authorId: 'user-business-1',
        authorName: 'Sarah Jenkins',
        authorRole: 'business',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
        content: 'Great initiative! Standard Bank’s 2026 Graduate tech pods look for exactly this kind of real-world problem-solving. Have you applied yet?',
        timestamp: '40 mins ago'
      }
    ]
  },
  {
    id: 'post-2',
    authorId: 'user-alumni-1',
    authorName: 'Lerato Khumalo',
    authorRole: 'alumni',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    authorHeadline: 'Senior Cloud Solutions Architect @ Vodacom | Alumna 2021',
    campus: 'Pretoria Campus',
    timestamp: '5 hours ago',
    type: 'career_journey',
    content: '✨ Career Reflection for Richfield Undergrads:\n\nThree years ago, I was sitting in the Pretoria campus computer lab debugging SQL join queries with my classmates. Today, I lead cloud migrations spanning millions of mobile subscribers across Southern Africa.\n\nKey takeaways for every current student:\n1. Treat every coursework project like a commercial client assignment.\n2. Build a public GitHub portfolio early.\n3. Don’t wait until final semester to verify your Enrich profile and start networking.\n\nMy DMs are open for any Richfield scholar needing guidance on AWS certifications!',
    tags: ['AlumniJourney', 'RichfieldPride', 'CloudArchitecture', 'Mentorship'],
    likes: 89,
    hasLiked: true,
    targetAudience: 'students',
    comments: [
      {
        id: 'c-3',
        authorId: 'user-student-1',
        authorName: 'Thabo Molefe',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
        content: 'Truly inspiring Lerato! Connecting with you right away.',
        timestamp: '3 hours ago'
      }
    ]
  },
  {
    id: 'post-3',
    authorId: 'user-admin-1',
    authorName: 'Dr. Khulekani Dlamini',
    authorRole: 'admin',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    authorHeadline: 'Dean of Student Affairs & Placements @ Richfield College',
    campus: 'Executive Campus',
    timestamp: '1 day ago',
    type: 'campus_update',
    content: '📢 Official Announcement:\n\nRichfield College and the AAA School of Advertising have officially finalized the 2026 National Industry Partnership Forum! Over 25 corporate partners—including Standard Bank, Vodacom, Entelect, and Ogilvy—will be recruiting directly through the Enrich platform.\n\nAll students are reminded to ensure their institutional email (@my.richfield.ac.za) is verified to unlock automated recruiter matchmaking and the AI Profile Assistant.',
    tags: ['InstitutionalAnnouncement', 'CareerPlacement', 'RichfieldOfficial'],
    likes: 124,
    hasLiked: false,
    targetAudience: 'all',
    comments: []
  }
];

export const INITIAL_EVENTS: RichfieldEvent[] = [
  {
    id: 'event-1',
    title: 'Richfield Annual Tech Fair & Recruiter Showcase 2026',
    type: 'career_fair',
    date: '18 October 2026',
    time: '09:00 - 15:30 SAST',
    location: 'Braamfontein Campus Auditorium & Virtual Livestream',
    campus: 'Braamfontein Campus',
    description: 'Meet senior engineering leaders and early-talent recruiters from 30+ leading South African enterprises. Features live on-the-spot CV reviews, coding challenges, and mock interviews.',
    organizer: 'Richfield Placements & Corporate Relations',
    rsvpCount: 248,
    hasRsvp: true,
    speaker: 'Keynote by Standard Bank & Vodacom CTOs'
  },
  {
    id: 'event-2',
    title: 'AAA & Richfield Creative-Tech Hackathon: FinTech for All',
    type: 'hackathon',
    date: '02 November 2026',
    time: '48 Hours (Starts 18:00 Friday)',
    location: 'Durban Centenary Campus & Online Discord',
    campus: 'Durban Centenary Campus',
    description: 'Join cross-disciplinary teams pairing Richfield IT programmers with AAA design/marketing creatives to build human-centered financial inclusion tools. R50,000 in grand prizes and internship fast-tracks!',
    organizer: 'Richfield Innovation Labs',
    rsvpCount: 164,
    hasRsvp: false
  },
  {
    id: 'event-3',
    title: 'Alumni Masterclass: Navigating Cloud Certifications in SA',
    type: 'alumni_panel',
    date: '28 October 2026',
    time: '17:00 - 18:30 SAST',
    location: 'Live on Enrich Platform Stream',
    campus: 'National / Online',
    description: 'Richfield alumni who recently attained AWS, Azure, and Google Cloud professional certifications share their study schedules, exam techniques, and how it helped them land 6-figure salaries.',
    organizer: 'Richfield Alumni Mentorship Society',
    rsvpCount: 95,
    hasRsvp: true,
    speaker: 'Lerato Khumalo (Vodacom) & Sipho Sithole (AWS)'
  }
];

export const ALUMNI_TRAJECTORIES: AlumniCareerTrajectory[] = [
  {
    id: 'traj-1',
    alumnusName: 'Lerato Khumalo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    degree: 'BSc Information Technology',
    graduationYear: 2021,
    currentRole: 'Senior Cloud Solutions Architect',
    currentCompany: 'Vodacom South Africa',
    steps: [
      {
        year: '2018 - 2021',
        title: 'BSc IT Scholar',
        organization: 'Richfield Pretoria Campus',
        highlight: 'Graduated cum laude; led student cloud study group and won inter-campus software competition.'
      },
      {
        year: '2021 - 2022',
        title: 'Graduate Cloud Engineer',
        organization: 'Vodacom Early Careers',
        highlight: 'Completed 12-month rotation; earned AWS Solutions Architect Associate badge.'
      },
      {
        year: '2022 - 2023',
        title: 'Cloud DevOps Specialist',
        organization: 'Vodacom Infrastructure',
        highlight: 'Automated CI/CD pipelines reducing deployment downtime by 40%.'
      },
      {
        year: '2023 - Present',
        title: 'Senior Cloud Solutions Architect',
        organization: 'Vodacom Group',
        highlight: 'Designing enterprise multi-region cloud topology for 40M+ telecom customers.'
      }
    ],
    advice: 'Never treat your exams as the finish line. In technology, what you build outside of class determines which doors open.'
  },
  {
    id: 'traj-2',
    alumnusName: 'Kagiso Ndlovu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    degree: 'Diploma in Information Technology',
    graduationYear: 2020,
    currentRole: 'Lead Security Engineer',
    currentCompany: 'Capitec Bank',
    steps: [
      {
        year: '2017 - 2020',
        title: 'Diploma in IT Candidate',
        organization: 'Richfield Durban Campus',
        highlight: 'Specialized in computer networking and cryptography; certified CompTIA Security+.'
      },
      {
        year: '2020 - 2022',
        title: 'SOC Analyst',
        organization: 'First National Bank',
        highlight: 'Monitored cyber threat incidents across enterprise banking endpoints.'
      },
      {
        year: '2022 - Present',
        title: 'Lead Security Engineer',
        organization: 'Capitec Bank',
        highlight: 'Leading application security hardening and biometric authentication protocols.'
      }
    ],
    advice: 'Cybersecurity has a massive skills shortage in South Africa. Start with basic networking and understand how attackers exploit misconfigurations.'
  },
  {
    id: 'traj-3',
    alumnusName: 'Nandi Sithole',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face',
    degree: 'BCom Accounting & Information Systems',
    graduationYear: 2022,
    currentRole: 'Fintech Product Manager',
    currentCompany: 'Yoco Technologies',
    steps: [
      {
        year: '2019 - 2022',
        title: 'BCom Scholar',
        organization: 'Richfield Cape Town Campus',
        highlight: 'Served as Student Representative Council treasurer; built fintech business plans.'
      },
      {
        year: '2022 - 2023',
        title: 'Associate Product Analyst',
        organization: 'Yoco',
        highlight: 'Analyzed merchant card machine onboarding drop-off metrics and optimized user flow.'
      },
      {
        year: '2023 - Present',
        title: 'Fintech Product Manager',
        organization: 'Yoco',
        highlight: 'Managing tap-to-pay mobile checkout features for 200,000+ SMMEs in SA.'
      }
    ],
    advice: 'Bridge the gap between code and commercial viability. Companies prize engineers and business minds who understand customer ROI.'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'verification',
    title: 'Richfield Institutional Verification Confirmed',
    message: 'Your institutional email thabo.molefe@my.richfield.ac.za has been verified by Richfield Registry.',
    timestamp: '10 mins ago',
    read: false
  },
  {
    id: 'notif-2',
    type: 'opportunity',
    title: 'New High Match Opportunity (94%)',
    message: 'Standard Bank posted Graduate Software Engineer (2026 Cohort). Your profile is in the top 5% of candidate matches!',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 'notif-3',
    type: 'connection',
    title: 'Connection Accepted',
    message: 'Lerato Khumalo (Senior Cloud Solutions Architect @ Vodacom) accepted your connection request.',
    timestamp: '2 hours ago',
    read: true
  },
  {
    id: 'notif-4',
    type: 'announcement',
    title: 'Dean’s Office: 2026 Tech Fair Registration Open',
    message: 'RSVP now for the Richfield Annual Tech Fair on 18 October 2026.',
    timestamp: '1 day ago',
    read: true
  }
];

export const RICHFIELD_CAMPUSES = [
  'Braamfontein Campus, Johannesburg',
  'Pretoria Campus, Gauteng',
  'Durban Centenary Campus, KZN',
  'Cape Town Campus, Western Cape',
  'Bryanston Executive Campus, Gauteng',
  'Polokwane Campus, Limpopo',
  'Gqeberha (Port Elizabeth) Campus, Eastern Cape',
  'Bloemfontein Campus, Free State'
];

export const RICHFIELD_PROGRAMMES = [
  'Bachelor of Science in Information Technology (BSc IT)',
  'Bachelor of Commerce (BCom)',
  'Bachelor of Commerce (AGA) (Associate General Accountant track)',
  'Bachelor of Commerce (AGA IT)',
  'BCom (AGA IT) Bridging Programme',
  'Bachelor of Business Administration (BBA)',
  'Bachelor of Public Management (BPM)',
  'Honours in Bachelor of Science in Information Technology',
  'Postgraduate Diploma in Management (PGDM)',
  'Master of Business Administration (MBA)',
  'Diploma in Information Technology (DIT)',
  'Diploma in Business Administration (DBA)',
  'Higher Certificate in Information Technology (HCIT)',
  'Higher Certificate in Computer Forensics (HCCF)',
  'Higher Certificate in Business Administration (HCBA)'
];

export const MOCK_USERS = INITIAL_USERS;
export const MOCK_OPPORTUNITIES = INITIAL_OPPORTUNITIES;
export const MOCK_POSTS = INITIAL_POSTS;
export const MOCK_EVENTS = INITIAL_EVENTS;

