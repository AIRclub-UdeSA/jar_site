export const SITE = {
  name: 'Desafío SAR',
  tagline: 'Challenge JAR 2026',
  description:
    'Desafío de búsqueda y rescate autónomo para las Jornadas Argentinas de Robótica. Robots ROSMASTER X3 con ROS 2 Humble, simulación en Gazebo y workshops asincrónicos. Organiza AIR Club UdeSA.',
  org: 'AIR Club UdeSA',
  orgSubtitle: 'Artificial Intelligence & Robotics Club',
  orgUrl: 'https://clubroboticaudesa.netlify.app',
  githubOrg: 'https://github.com/AIRclub-UdeSA',
  simRepo: 'https://github.com/AIRclub-UdeSA/yahboom_rosmaster',
  workshopsRepo: 'https://github.com/AIRclub-UdeSA/jar_workshops',
  editBaseUrl: 'https://github.com/AIRclub-UdeSA/jar_site/edit/main/src/content/docs/',
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
  { label: 'La competencia', href: '/competencia/reglas/' },
  { label: 'Setup', href: '/setup/' },
  { label: 'Workshops', href: '/workshops/' },
];

export const DOC_SECTIONS: NavSection[] = [
  {
    label: 'Competencia',
    items: [
      { label: 'Reglas', href: '/competencia/reglas/' },
      { label: 'Robot y mapa', href: '/competencia/robot-y-mapa/' },
      { label: 'Puntuación', href: '/competencia/puntuacion/' },
    ],
  },
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
