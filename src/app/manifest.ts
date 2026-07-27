import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DAFA Manager',
    short_name: 'DAFA',
    description: 'Hệ thống quản lý công việc và đánh giá KPI nội bộ',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8f7',
    theme_color: '#444444',
    icons: [
      {
        src: '/dafa-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/dafa-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
