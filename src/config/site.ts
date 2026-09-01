export const SITE = {
  name: 'Challenge JAR',
  tagline: 'JAR 2026 · AIR Club UdeSA',
  description:
    'El AIR Club UdeSA presenta un desafío de comportamiento robótico con robots ROSMASTER X3 en la Jornada Argentina de Robótica 2026. Simulación en Gazebo, workshops asincrónicos y una tarea a revelar.',
  org: 'AIR Club UdeSA',
  orgSubtitle: 'Artificial Intelligence & Robotics Club',
  orgUrl: 'https://clubroboticaudesa.netlify.app',
  githubOrg: 'https://github.com/AIRclub-UdeSA',
  simRepo: 'https://github.com/AIRclub-UdeSA/yahboom_rosmaster',
  workshopsRepo: 'https://github.com/AIRclub-UdeSA/jar_workshops',
  applyUrl: 'https://forms.gle/2zkW6gwJQptUzbXn6',
  event: {
    city: 'Rosario',
    dateRange: '3 al 6 de noviembre de 2026',
    shortDate: '03–06 nov 2026',
    venue: 'Predio del CUR · "La Siberia"',
    officialUrl: 'https://jar.net.ar/',
    venueUrl: 'https://www.google.com/maps/place/La+Siberia+-+Centro+Universitario+Rosario+(CUR)/@-32.9666336,-60.6257725,15.63z/data=!4m6!3m5!1s0x95b7aa53ea64d915:0x3538499b08835639!8m2!3d-32.9661559!4d-60.6233572!16s%2Fg%2F1224z7kt',
  },
};

export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}${path}`;
};

export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_LINKS: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Setup', href: '/setup/' },
  { label: 'Workshops', href: '/workshops/' },
];

export const DOC_SECTIONS: NavSection[] = [
  {
    label: 'Setup',
    items: [
      { label: 'Guía de instalación', href: '/setup/' },
      { label: 'ROS 2 Humble', href: '/setup/ros2-humble/' },
      { label: 'Gazebo y RViz', href: '/setup/gazebo-rviz/' },
      { label: 'Simulador ROSMASTER', href: '/setup/simulador/' },
    ],
  },
];
