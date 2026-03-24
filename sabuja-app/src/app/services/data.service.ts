import { Injectable } from '@angular/core';

export interface OrganizationInfo {
  name: string;
  tagline: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  category: string;
  volunteers: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  avatar: string;
  contributions: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  private organizationInfo: OrganizationInfo = {
    name: 'Brahmapur Sabuja Bahini',
    tagline: 'Green City, Clean City',
    description: 'Environmental NGO dedicated to making Berhampur greener and cleaner through tree plantation, community awareness, and sustainable practices.',
    colors: {
      primary: '#2e7d32',
      secondary: '#00796b',
      accent: '#ff6f00'
    }
  };

  private events: Event[] = [
    {
      id: '1',
      title: 'Tree Plantation Drive',
      description: 'Join us in planting 1000 trees across the city',
      date: '2024-04-15',
      location: 'Berhampur City Park',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
      category: 'Tree Planting',
      volunteers: 150
    },
    {
      id: '2',
      title: 'Waste Cleanup Campaign',
      description: 'Clean the beaches and parks of Berhampur',
      date: '2024-04-22',
      location: 'Chandrabaga Beach',
      image: 'https://images.unsplash.com/photo-1559027615-cd5628902c4a?w=400&h=400&fit=crop',
      category: 'Beach Cleanup',
      volunteers: 200
    },
    {
      id: '3',
      title: 'Environmental Awareness Workshop',
      description: 'Learn about sustainable living and environmental conservation',
      date: '2024-05-01',
      location: 'Community Center',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
      category: 'Workshop',
      volunteers: 75
    }
  ];

  private services: Service[] = [
    {
      id: '1',
      title: 'Tree Plantation',
      description: 'We plant native trees across Berhampur to increase green cover and combat climate change',
      icon: 'leaf-outline',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop'
    },
    {
      id: '2',
      title: 'Community Cleanup',
      description: 'Regular cleanup drives to keep our beaches, parks, and streets clean',
      icon: 'trash-outline',
      image: 'https://images.unsplash.com/photo-1559027615-cd5628902c4a?w=400&h=400&fit=crop'
    },
    {
      id: '3',
      title: 'Education & Awareness',
      description: 'Workshops and campaigns to spread environmental consciousness',
      icon: 'school-outline',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop'
    },
    {
      id: '4',
      title: 'Sustainability Projects',
      description: 'Innovative projects for sustainable living and renewable energy',
      icon: 'bulb-outline',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop'
    }
  ];

  constructor() { }

  getOrganizationInfo(): OrganizationInfo {
    return this.organizationInfo;
  }

  getEvents(): Event[] {
    return this.events;
  }

  getServices(): Service[] {
    return this.services;
  }

  getStats() {
    return {
      volunteers: 250,
      treesPlanted: 15000,
      driversCompleted: 150,
      membersCount: 500
    };
  }
}
