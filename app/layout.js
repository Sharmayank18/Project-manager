import './globals.css'

export const metadata = {
  title: 'Project Manager',
  description: 'Team project and task management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}